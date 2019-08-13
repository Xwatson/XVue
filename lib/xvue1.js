class XVue {
    constructor(options) {
        this.$options = options;
        this.$data = options.data;
        this.$el = options.el;
        // 执行定义defineProperty
        this.observe(this.$data);

        // 初始化编译
        new Compile(this.$el, this);
    }
    /**
     * 执行响应式
     */
    observe(value) {
        if (!value || typeof value !== 'object') {
            return;
        }
        // 遍历data，为每一个key定义响应式
        Object.keys(value).forEach(key => {
            this.defineReactive(value, key, value[key]);
            // 给vue实例添加data代理，方便在实例中访问data数据
            this.proxyData(key);
        })
    }
    /**
     * 定义响应式
     * @param {*} obj 目标对象
     * @param {*} key key
     * @param {*} val value 
     */
    defineReactive(obj, key, val) {
        const dep = new Dep();
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                // 将实例化的Watcher添加到Dep管理器
                Dep.target && dep.addDep(Dep.target);
                return val;
            },
            set(newVal) {
                if (newVal === val) {
                    return
                }
                val = newVal;
                dep.notify();
            }
        })
        this.observe(val); // 地柜查找嵌套属性
    }

    proxyData(key) {
        Object.defineProperty(this, key, {
            get() {
                return this.$data[key];
            },
            set(newVal) {
                this.$data[key] = newVal;
            }
        })
    }
}

// 依赖管理器，负责将视图中所有依赖收集管理，包含添加依赖和通知
class Dep {
    constructor() {
        // 用于存放Watcher实例
        this.deps = [];
    }
    /**
     * 添加依赖
     */
    addDep(dep) {
        this.deps.push(dep);
    }
    /**
     * 通知watcher更新
     */
    notify() {
        // 通知所有watcher更新
        console.log('aa', this.deps)
        this.deps.forEach(dep => dep.update());
    }
}
// 更新代码的执行者
class Watcher {
    constructor(vm, field, cb) {
        this.vm = vm;
        this.field = field;
        this.cb = cb;
        // 当new一个监听器时，将当前实例附加到 Dep.target上，用于把Watcher和Dep串联起来
        Dep.target = this;
        this.vm[this.field]; // 触发$data中定义的get，实例化Dep
        Dep.target = null; // 立即清空target避免不必要添加
    }
    // 更新
    update() {
        console.log(this.field)
        // console.log('试图更新！');
        this.cb.call(this.vm, this.vm[this.field]);
    }
}