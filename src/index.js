// import 'expose-loader?$!jquery';
// // import 'expose-loader?THREE!three';

const { EventEmitter } = require('events')

class CustomPromise extends EventEmitter {
    constructor(executor) {
        super()

        const resolve = (value) => this.emit('resolve', value)
        const reject = (reason) => this.emit('reject', reason)

        executor && executor(resolve, reject)
    }

    then(resolveHandler, rejectHandler) {
        const promise = new CustomPromise()

        if (resolveHandler) {
            this.on('resolve', (value) => {
                const result = resolveHandler(value)
                promise.emit('resolve', result)
            })
        }

        if (rejectHandler) {
            this.on('reject', (reason) => {
                const result = rejectHandler(result)
                promise.emit('reject', reason)
            })
        } else {
            this.on('reject', (reason) => promise.emit('reject', reason))
        }

        return promise
    }

    catch(handler) {
        this.on('reject', handler)
    }
}

CustomPromise.all = function(promises) {
    return new CustomPromise(function (resolve, reject) {
        const result = []
        const handler = i => item => {
            result[i] = item
            result.filter(item => !!item).length === promises.length && (resolve(result))
        }
    
        promises.forEach((element, i) => {
            element.then(handler(i))
        });
    })
}

const promise1 = new CustomPromise(function(resolve, reject) {
    setTimeout(function() {
        resolve(1)
    }, 1000)
})

const promise2 = new CustomPromise(function(resolve, reject) {
    setTimeout(function() {
        resolve(2)
    }, 3000)
})

const promise3 = new CustomPromise(function(resolve, reject) {
    setTimeout(function() {
        resolve(3)
    }, 1000)
})

CustomPromise.all([promise1, promise2, promise3]).then(result => {
    console.log('result', result)
})