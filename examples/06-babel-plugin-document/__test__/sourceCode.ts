/**
 * say 你好
 * @param name {string} 名字
 * @param age {number} 年龄
 * @param v3 {boolean} 是否
 * @returns {string} 
 */
function sayHi(name: string, age: number, v3: boolean): string {
  console.log(`hi, ${name}`);
  return `hi, ${name}`;
}

/**
 * 类测试
 */
class Guang {
  name: string; // name 属性
  constructor(name: string) {
    this.name = name;
  }

  /**
   * 方法测试
   */
  sayHi(): string {
    return `hi, I'm ${this.name}`;
  }
}
