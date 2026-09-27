#!/bin/bash
set -e
ls -la ~/app/database/fmcg.db
~/app/backend/venv/bin/python -c "
import sqlite3
c = sqlite3.connect('/home/ubuntu/app/database/fmcg.db')
print('rows:', c.execute('SELECT COUNT(*) FROM sales').fetchone())
"
