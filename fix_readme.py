import re

# Read the README file
with open('README.md', 'r', encoding='utf-8') as file:
    content = file.read()

# Replace the problematic emoji placeholders with actual emojis
content = content.replace('### � 核心功能文档', '### ��� 核心功能文档')
content = content.replace('### � 安全与审计文档', '### ��� 安全与审计文档')
content = content.replace('### � 开发工具文档', '### ��� 开发工具文档')
content = content.replace('### � CI/CD与构建文档', '### ��� CI/CD与构建文档')
content = content.replace('### � 完整开发流程', '### ��� 完整开发流程')
content = content.replace('### � 文档组织结构', '### ��� 文档组织结构')
content = content.replace('### � 文档使用指南', '### ��� 文档使用指南')
content = content.replace('### � 文档特点', '### ��� 文档特点')

# Write the corrected content back to the file
with open('README.md', 'w', encoding='utf-8') as file:
    file.write(content)

print("Emoji placeholders replaced successfully")
