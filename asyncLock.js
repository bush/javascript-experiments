class AsyncLock {
  locks = {};

  acquire(key,promise) {
    return new Promise((resolve, reject) => {

        if(!(key in this.locks)) {
          this.locks[key] = {
            queue: [],
            workingOnPromise: false
          }
        }

        let lock = this.locks[key];

  
        lock.queue.push({
            promise,
            resolve,
            reject,
        });

        this.dequeue(key);
    });
  }

 dequeue(key) {
    let lock = this.locks[key]
    
    if (lock.workingOnPromise) {
      return false;
    }

    const item = lock.queue.shift();

    if (!item) {
      delete this.locks[key]
      return false;
    }

    try {
      lock.workingOnPromise = true;
      item.promise()
        .then((value) => {
          lock.workingOnPromise = false;
          item.resolve(value);
          this.dequeue(key);
        })
        .catch(err => {
          lock.workingOnPromise = false;
          item.reject(err);
          this.dequeue(key);
        })
    } catch (err) {
      lock.workingOnPromise = false;
      item.reject(err);
      this.dequeue(key);
    }
    return true;
  }
}


function wait(delay, cookie) {
  let prom = new Promise((resolve) => {
    setTimeout(() => {
      console.log(`finishing ${cookie}`);
      resolve(cookie)
    }, delay);
  });
  return prom;
}



function request(delay,cookie) {
  lock.acquire('foo',() => {
    console.log(`starting ${cookie}`);
    return wait(delay,cookie)
  });
}

let lock = new AsyncLock()
request(5000,'first');
console.log('doing something...');
request(4000,'second');
request(3000,'third');
request(2000,'fourth');
console.log('doing something else');
