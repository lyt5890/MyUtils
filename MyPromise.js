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
/**
 *传入一个对象，判断是否是promise
 * @param {object} obj
 */
function isPromise(obj) {
  return !!(obj && typeof obj == "object" && typeof obj.then == "function");
}

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  /**
   * @param {Function}    executor promise传入的函数，立即执行
   */
  constructor(executor) {
    this._state = PENDING; //状态
    this._value = undefined; //数据
    this._handlers = []; //then函数的处理队列
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
    this._runHandlers(); //如果状态改变，那么就要执行handler
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
   *添加一条then函数中需要执行的对象到_handler中
   * @param {Function} executor //需要处理的函数
   * @param {String} state //需要在什么样的状态下执行
   * @param {Function} resolve //任务成功的相关数据
   * @param {Function} reject //任务失败的相关数据
   */
  _pushHandle(executor, state, resolve, reject) {
    this._handlers.push({
      executor,
      state,
      resolve,
      reject,
    });
  }

  /**
   * 找到符合条件的可运行对象来执行
   */
  _runHandlers() {
    //如果当前的状态是挂起的，那么不做操作
    if (this._state === PENDING) {
      return;
    }
    while (this._handlers[0]) {
      const handler = this._handlers[0];
      this._runOneHandler(handler);
      this._handlers.shift();
    }
  }

  /**
   * 运行一个handler
   * @param {Object} handler //需要判断是否可以运行的对象
   */
  _runOneHandler({ executor, state, resolve, reject }) {
    runMicroTask(() => {
      //判断当前Mypromise的状态，找到状态一致的对象之后再执行
      if (state !== this._state) {
        return;
      }
      //如果传递的不是函数，那么就会导致穿透，结果与上一次一致
      if (typeof executor !== "function") {
        // 值与上一次的一致
        this._state === FULFILLED ? resolve(this._value) : reject(this._value);
        return;
      }
      try {
        //得到Mypromise返回的值
        const result = executor(this._value);
        //如果返回的是promise，那么就等待执行之后运行handler的resolve或reject
        if (isPromise(result)) {
          result.then(resolve, reject);
        } else {
          //不是promise 那么就直接成功，传递返回值
          resolve(result);
        }
      } catch (error) {
        // executor(this._value); 运行失败的处理
        reject(error);
        console.log(error);
      }
      //
    });
    // console.log(executor);
  }

  /**
   * promise A+规范规定的then函数
   * @param {Function} onFulfilled promise完成之后的处理函数
   * @param {Function} onRejected promise失败之后的处理函数
   * @returns Promise
   */
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this._pushHandle(onFulfilled, FULFILLED, resolve, reject);
      this._pushHandle(onRejected, REJECTED, resolve, reject);
      this._runHandlers(); //每添加一个then之后，需要执行一下hendler
    });
  }
}
