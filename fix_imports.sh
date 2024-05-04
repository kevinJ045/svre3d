
find ./server -iname '*.ts' -exec sed -i -E 's/(import\s.*[$'\''"](\.\/|\.\.\/)[^$'\''"]+)([$'\''"])/\1.js\3/g' {} \;
