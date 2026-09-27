#!/usr/bin/env python3
"""Convert seed-2.sql INSERT statements to CSV."""
import csv
import json
import re
import sys

INPUT = "seed-2.sql"
OUTPUT = "seed-2.csv"

COLUMNS = [
    "id", "name", "address", "district", "state", "status",
    "description", "area_m2", "total_shop",
    "parking_available", "parking_accessible", "parking_notes",
    "amen_toilet", "amen_prayer_room",
    "location", "schedule",
    "created_at", "updated_at", "shop_list"
]

def parse_sql_values(sql_text):
    # Extract everything between VALUES\n\n and the final semicolon
    match = re.search(r'VALUES\s*\n\n(.+);?\s*$', sql_text, re.DOTALL)
    if not match:
        raise ValueError("Could not find VALUES block")
    values_block = match.group(1).strip().rstrip(';')

    rows = []
    # Each row is a parenthesized group ending with ),
    # Use a state machine to split rows properly
    depth = 0
    in_str = False
    escape = False
    row_start = None

    for i, ch in enumerate(values_block):
        if escape:
            escape = False
            continue
        if ch == '\\' and in_str:
            escape = True
            continue
        if ch == "'" and not escape:
            in_str = not in_str
            continue
        if in_str:
            continue
        if ch == '(':
            if depth == 0:
                row_start = i
            depth += 1
        elif ch == ')':
            depth -= 1
            if depth == 0 and row_start is not None:
                rows.append(values_block[row_start+1:i])
                row_start = None

    return rows

def parse_row(row_str):
    """Parse a single row's comma-separated values handling nested JSON and strings."""
    values = []
    current = []
    depth = 0  # tracks {}, []
    in_str = False
    escape = False
    i = 0

    while i < len(row_str):
        ch = row_str[i]

        if escape:
            current.append(ch)
            escape = False
            i += 1
            continue

        if ch == '\\' and in_str:
            current.append(ch)
            escape = True
            i += 1
            continue

        if ch == "'":
            if not in_str:
                in_str = True
                i += 1
                continue
            else:
                # Check for escaped quote ''
                if i + 1 < len(row_str) and row_str[i+1] == "'":
                    current.append("'")
                    i += 2
                    continue
                else:
                    in_str = False
                    i += 1
                    continue

        if in_str:
            current.append(ch)
            i += 1
            continue

        if ch in ('{', '['):
            depth += 1
            current.append(ch)
            i += 1
            continue

        if ch in ('}', ']'):
            depth -= 1
            current.append(ch)
            i += 1
            continue

        if ch == ',' and depth == 0:
            val = ''.join(current).strip()
            values.append(val)
            current = []
            i += 1
            continue

        current.append(ch)
        i += 1

    if current:
        values.append(''.join(current).strip())

    # Normalize values: strip ::jsonb etc, handle NULL
    normalized = []
    for v in values:
        v = v.strip()
        # Remove type casts like ::jsonb
        v = re.sub(r'::[a-z]+$', '', v)
        if v.upper() == 'NULL':
            v = ''
        normalized.append(v)

    return normalized

def main():
    with open(INPUT, encoding='utf-8') as f:
        sql = f.read()

    rows_str = parse_sql_values(sql)
    print(f"Found {len(rows_str)} rows")

    with open(OUTPUT, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(COLUMNS)
        for i, row_str in enumerate(rows_str):
            values = parse_row(row_str)
            if len(values) != len(COLUMNS):
                print(f"Row {i+1}: expected {len(COLUMNS)} cols, got {len(values)} — skipping", file=sys.stderr)
                print(f"  Preview: {row_str[:120]}", file=sys.stderr)
                continue
            writer.writerow(values)

    print(f"Written to {OUTPUT}")

if __name__ == '__main__':
    main()
