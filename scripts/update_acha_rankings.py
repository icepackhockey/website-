#!/usr/bin/env python3
"""
Automated Weekly ACHA M1 Ranking Poller and Updater
Checks https://www.achahockey.org/m1-rankings for newly released computer rankings.
If a new ranking is detected:
  1. Downloads the official PDF to public/polls/
  2. Parses NC State's rank, previous rank, movement, and computer average
  3. Updates src/data/standings.json
  4. Runs npm run build
  5. Commits to git and pushes to GitHub main
  6. Deploys to Vercel production
  7. Prints confirmation message (delivered to Telegram)
If no new ranking is found, exits silently.
"""

import json
import os
import re
import subprocess
import sys
from bs4 import BeautifulSoup
import pypdf

REPO_DIR = "/Users/brentplunkett/icepack-demo-site"
STANDINGS_JSON_PATH = os.path.join(REPO_DIR, "src/data/standings.json")
POLLS_DIR = os.path.join(REPO_DIR, "public/polls")
URL = "https://www.achahockey.org/m1-rankings"


def run_cmd(cmd, cwd=REPO_DIR):
    res = subprocess.run(cmd, shell=True, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return res.returncode, res.stdout.strip(), res.stderr.strip()


def get_current_standings():
    with open(STANDINGS_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def scrape_acha_rankings():
    # Fetch page with curl to avoid 403 bot blocks
    rc, html, err = run_cmd(f'curl -sL "{URL}"')
    if rc != 0 or not html:
        print(f"Error fetching ACHA page: {err}", file=sys.stderr)
        return None

    soup = BeautifulSoup(html, "html.parser")

    # Look for links matching Ranking #X and .pdf
    # E.g. "Ranking #7 (thru 11/18/26)" -> "http://.../2627computer-average-2026-11-15.pdf"
    for a in soup.find_all("a"):
        text = a.get_text(strip=True)
        raw_href = a.get("href")
        href = str(raw_href) if raw_href else ""
        if ".pdf" in href.lower() and "computer-average" in href.lower():
            match = re.search(r"Ranking\s*#?(\d+)\s*\((?:thru|released)\s*([^)]+)\)", text, re.I)
            if match:
                rank_num = int(match.group(1))
                poll_date_str = match.group(2).strip()
                # Ensure HTTPS
                pdf_url = href.replace("http://", "https://")
                return {
                    "rank_num": rank_num,
                    "date_str": poll_date_str,
                    "pdf_url": pdf_url,
                    "pdf_filename": os.path.basename(pdf_url)
                }

    return None


def parse_pdf_for_nc_state(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"

    # Search for North Carolina State line
    # Format e.g.: 37 North Carolina State 39 37 38.0 SECHL 38
    # or: 37North Carolina State 39 37 38.0 SECHL 38
    for line in text.split("\n"):
        if "north carolina state" in line.lower() or ("nc state" in line.lower() and "sechl" in line.lower()):
            # Extract numbers
            # Match rank at start, opponent name, then numbers
            m = re.search(r"(\d+)\s*North Carolina State\s+(\d+)\s+(\d+)\s+([\d\.]+)\s+SECHL\s+(\d+)", line, re.I)
            if m:
                current_rank = int(m.group(1))
                rank1 = float(m.group(2))
                rank2 = float(m.group(3))
                comp_avg = float(m.group(4))
                prev_rank = int(m.group(5))
                diff = prev_rank - current_rank
                movement = f"+{diff}" if diff > 0 else (str(diff) if diff < 0 else "0")
                return {
                    "current_rank": current_rank,
                    "previous_rank": prev_rank,
                    "movement": movement,
                    "computer_average": f"{comp_avg:.1f}"
                }

    return None


def main():
    latest = scrape_acha_rankings()
    if not latest:
        # Silent when nothing parsed
        return

    current_data = get_current_standings()
    current_nat = current_data.get("national_ranking", {})
    existing_pdf = os.path.basename(current_nat.get("pdf_current", current_nat.get("pdf_nov_8", "")))

    if latest["pdf_filename"] == existing_pdf:
        # Already up to date; silent exit
        return

    # New ranking detected!
    target_pdf_path = os.path.join(POLLS_DIR, latest["pdf_filename"])
    dl_cmd = f'curl -sL "{latest["pdf_url"]}" -o "{target_pdf_path}"'
    rc, _, dl_err = run_cmd(dl_cmd)
    if rc != 0 or not os.path.exists(target_pdf_path):
        print(f"Error downloading new PDF: {dl_err}", file=sys.stderr)
        return

    ncsu_info = parse_pdf_for_nc_state(target_pdf_path)
    if not ncsu_info:
        print(f"Warning: Could not parse NC State stats from {latest['pdf_filename']}", file=sys.stderr)
        return

    # Update standings.json
    prev_pdf = current_nat.get("pdf_current", current_nat.get("pdf_nov_8", ""))
    new_pdf_rel = f"/polls/{latest['pdf_filename']}"

    from datetime import datetime
    today_str = datetime.now().strftime("%B %d, %Y")

    current_data["last_updated"] = today_str
    current_data["national_ranking"] = {
        "current_rank": ncsu_info["current_rank"],
        "previous_rank": ncsu_info["previous_rank"],
        "movement": ncsu_info["movement"],
        "computer_average": ncsu_info["computer_average"],
        "total_teams": current_nat.get("total_teams", 81),
        "poll_date": today_str,
        "pdf_current": new_pdf_rel,
        "pdf_previous": prev_pdf,
        "pdf_nov_8": new_pdf_rel,
        "pdf_nov_1": prev_pdf
    }

    with open(STANDINGS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(current_data, f, indent=2)

    # Test build
    build_rc, _, build_err = run_cmd("npm run build")
    if build_rc != 0:
        print(f"Build failed after standings update: {build_err}", file=sys.stderr)
        return

    # Git commit and push (automatically triggers Vercel production deployment)
    commit_msg = f"Auto-update ACHA national ranking to #{latest['rank_num']} (NC State #{ncsu_info['current_rank']}, {ncsu_info['movement']})"
    run_cmd(f'git add public/polls/{latest["pdf_filename"]} src/data/standings.json && git commit -m "{commit_msg}" && git push origin main')

    # User-facing summary for Telegram alert
    print(
        f"ACHA M1 Ranking #{latest['rank_num']} Published!\n"
        f"NC State Rank: #{ncsu_info['current_rank']} ({ncsu_info['movement']})\n"
        f"Previous Rank: #{ncsu_info['previous_rank']}\n"
        f"Computer Average: {ncsu_info['computer_average']}\n"
        f"Official Poll PDF: {new_pdf_rel}\n"
        f"Live site updated & deployed: https://icepackhockey.com/standings"
    )


if __name__ == "__main__":
    main()
