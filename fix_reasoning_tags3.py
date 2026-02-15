#!/usr/bin/env python3

with open('/home/runner/work/newclaw/newclaw/src/shared/text/reasoning-tags-new.ts', 'r') as f:
    lines = f.readlines()

# Fix line 143 (index 142)
lines[142] = '  cleaned = cleaned.replace(/<thought>/g, "Đthought");\n'

with open('/home/runner/work/newclaw/newclaw/src/shared/text/reasoning-tags-new.ts', 'w') as f:
    f.writelines(lines)

print("Fixed the special character in reasoning-tags-new.ts line 143")