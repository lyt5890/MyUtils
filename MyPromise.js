/**
 *
 * @param {Function} fn 需要放到微队列中的函数
 */
function runMicroTask(fn) {
  if (process && process.nextTick) {
    process.nextTick(fn);
  } else if (MutationObserver) {
    const p = document.querySelector("p");
    const observer = new MutationObserver(fn);
    observer.observe(p, { childList: true });
    p.innerHTML = "1";
  } else {
    // 不支持的话直接放到宏队列中运行
    setTimeout(fn, 0);
  }
}

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";
class MyPromise {
  /**
   * @param {Function}    executor promise传入的函数，立即执行
   */
  constructor(executor) {
    this._state = PENDING;
    this._value = undefined;
    try {
      executor(this._resolve.bind(this), this._reject.bind(this));
    } catch (error) {
      this._reject(error);
      console.log(error, "constructor");
    }
  }
  /**
   * 修改任务状态和值
   * @param {String} newState 需要改变的状态
   * @param {any} value 处理完成之后的值
   */
  _chengeState(newState, value) {
    if (this._state !== PENDING) {
      //当MyPromise的状态不是挂起的时候就证明已经完成该Mypromise，状态不可变，不再执行下面代码
      return;
    }
    this._state = newState;
    this._value = value;
  }
  /**
   *
   * @param {any} data 任务成功的相关数据
   */
  _resolve(data) {
    this._chengeState(FULFILLED, data);
  }
  /**
   *
   * @param {any} reason 任务失败的相关数据
   */
  _reject(reason) {
    this._chengeState(REJECTED, reason);
  }
  /**
   * promise A+规范规定的then函数
   * @param {Function} onFulfilled promise完成之后的处理函数
   * @param {Function} onRejected promise失败之后的处理函数
   * @returns
   */
  then(onFulfilled, onRejected) {
    return new MyPromise(fulfillment, onFulfilled, onRejected);
  }
}

const pro = new MyPromise((resolve, reject) => {
  resolve(123);
  reject(12333);
});
console.log(pro);
