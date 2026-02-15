#!/usr/bin/env python3

with open('/home/runner/work/newclaw/newclaw/src/shared/text/reasoning-tags-new.ts', 'r') as f:
    content = f.read()

# Replace the problematic line
content = content.replace(
    '  cleaned = cleaned.replace(//g, "Đthinking");',
    '  cleaned = cleaned.replace(//g, "Đthinking");'
)

with open('/home/runner/work/newclaw/newclaw/src/shared/text/reasoning-tags-new.ts', 'w') as f:
    f.write(content)

print("Fixed the empty regex in reasoning-tags-new.ts")