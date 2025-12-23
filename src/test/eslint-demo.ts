// ESLint 实时提示功能演示文件
// 此文件展示了 ESLint 实时提示的各种功能

// ❌ 未使用变量 - 会在编辑器中显示黄色波浪线
const unusedVariable = 'this is unused';

// ❌ 使用了 var - 会在编辑器中显示红色波浪线
const oldStyle = 'should use let or const';

// ❌ 应该使用 const - 会在编辑器中显示红色波浪线
const constantValue = 'this never changes';

// ✅ 正确的写法
const message = 'Hello ESLint实时提示!';
const numbers: number[] = [1, 2, 3, 4, 5];

// ❌ any 类型 - 会在编辑器中显示黄色波浪线
function processData(data: any): any {
  return data.processed;
}

// ✅ 正确的类型定义
function processUserData(userData: string): string {
  return userData.toUpperCase();
}

// ❌ 函数参数未使用 - 会在编辑器中显示黄色波浪线
function greet(name: string, age: number): string {
  return `Hello ${name}!`;
}

// ✅ 正确使用所有参数
function calculateSum(a: number, b: number): number {
  return a + b;
}

// 导出供其他模块使用
export { message, numbers, processUserData, greet, calculateSum };
