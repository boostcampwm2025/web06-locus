#!/usr/bin/env sh

red='\033[0;31m'
green='\033[0;32m'
yellow='\033[0;33m'
reset='\033[0m'

# 스테이징된 파일 목록을 가져옴
staged_files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx)$')

# 스테이징된 파일이 있는지 확인
if [ -z "$staged_files" ]; then
    echo -e "${yellow}No staged files found.${reset}"
    exit 0 
fi

# 스테이징된 파일에 console.log가 포함되어 있는지 확인
console_logs=$(echo "$staged_files" | xargs grep -Hn 'console\.log' 2>/dev/null)

if [ -n "$console_logs" ]; then
    echo -e "\n${red}COMMIT REJECTED! console.log를 제거해주세요.${reset}"
    echo -e "${yellow}Found console.log in:${reset}"
    echo "$console_logs"
    exit 1
fi

echo -e "${green}✓ No console.log found.${reset}"
exit 0
