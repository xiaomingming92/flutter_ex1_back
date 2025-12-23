// 混合权限设计实际应用示例
// 这个脚本展示了为什么实际项目中常用混合权限

// 1. 定义标准动作集合
const STANDARD_ACTIONS = {
  // 基础CRUD动作
  create: '创建',
  read: '查看',
  edit: '编辑',
  delete: '删除',
  publish: '发布',

  // 高级动作
  approve: '审核',
  ban: '封禁',
  verify: '认证',

  // 特殊动作
  config: '配置',
  backup: '备份',
  monitor: '监控',
};

// 2. 定义业务分类
const BUSINESS_CATEGORIES = {
  article: '文章管理',
  news: '新闻管理',
  user: '用户管理',
  system: '系统管理',
  vip: 'VIP权益',
  finance: '财务管理',
};

// 3. 自动生成权限
function generatePermissions() {
  const permissions = [];

  for (const [category, categoryName] of Object.entries(BUSINESS_CATEGORIES)) {
    for (const [action, actionName] of Object.entries(STANDARD_ACTIONS)) {
      const code = `${category}.${action}`;
      const name = `${actionName}${categoryName}`;

      permissions.push({
        name,
        description: `${actionName}相关${categoryName}的权限`,
        category,
        action,
        code,
        isActive: true,
      });
    }
  }

  return permissions;
}

// 4. 权限检查示例
function checkPermission(userPermissions, category, action) {
  const code = `${category}.${action}`;
  return userPermissions.includes(code);
}

// 5. 批量权限检查
function hasCategoryPermission(userPermissions, category) {
  return userPermissions.some(permission =>
    permission.startsWith(`${category}.`)
  );
}

// 6. 角色权限分配示例
const ROLES_PERMISSIONS = {
  超级管理员: generatePermissions(), // 所有权限

  内容编辑: generatePermissions().filter(p =>
    ['article', 'news'].includes(p.category)
  ),

  VIP用户: generatePermissions().filter(p => p.category === 'vip'),

  普通用户: generatePermissions().filter(
    p => p.category === 'article' && ['create', 'read'].includes(p.action)
  ),
};

// 使用示例
console.log('=== 混合权限设计优势 ===');

// 优势1: 灵活的权限检查
const userPerms = ['article.create', 'news.edit', 'vip.large_upload'];
console.log(
  '检查用户是否有文章创建权限:',
  checkPermission(userPerms, 'article', 'create')
); // true
console.log(
  '检查用户是否有新闻删除权限:',
  checkPermission(userPerms, 'news', 'delete')
); // false
console.log(
  '检查用户是否有任意VIP权限:',
  hasCategoryPermission(userPerms, 'vip')
); // true

// 优势2: 权限管理界面友好
const generatedPerms = generatePermissions();
console.log('\n=== 权限分组显示示例 ===');
generatedPerms.forEach(perm => {
  console.log(`${perm.name} (${perm.category}.${perm.action})`);
});

// 优势3: 便于权限扩展
console.log('\n=== 扩展新权限示例 ===');
const newPermissions = [
  { category: 'article', action: 'recommend', name: '推荐文章' },
  { category: 'user', action: 'export', name: '导出用户数据' },
];
newPermissions.forEach(perm => {
  console.log(`新增权限: ${perm.name} -> ${perm.category}.${perm.action}`);
});
