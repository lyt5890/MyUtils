/**
 * 函数柯里化
 */
function curry() {
  const fn = arguments[0]; //获取到需要执行的函数

  const args = [].slice.call(arguments, 1); //获取传递的参数，构成一个参数数组
  //如果剩余的值与函数运行所需要的值长度一致，那么就可以运行
  if (fn.length === args.length) {
    return fn.apply(this, args);
  }
  // 参数不够向外界返回的函数
  function _curry() {
    //将获取到的值添加到args数组中
    args.push(...arguments);
    //一旦长度一致就执行
    if (fn.length === args.length) {
      return fn.apply(this, args);
    }
    // 不一致则继续获取
    return _curry;
  }
  //获取函数运行所需要的剩余的值
  return _curry;
}
