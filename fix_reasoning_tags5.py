#!/usr/bin/env python3

with open('/home/runner/work/newclaw/newclaw/src/shared/text/reasoning-tags-new.ts', 'r') as f:
    lines = f.readlines()

# Fix line 142 (index 141)
lines[141] = '  cleaned = cleaned.replace(//g, "Đthinking");\n'

with open('/home/runner/work/newclaw/newclaw/src/shared/text/reasoning-tags-new.ts', 'w') as f:
    f.writelines(lines)

print("Fixed the empty regex in reasoning-tags-new.ts line 142 again")