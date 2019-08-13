// 编译
class Compile {
    /**
     * 构造器
     * @param {*} el 宿主元素选择器 
     * @param {*} vm 当前XVue实例
     */
    constructor(el, vm) {
        this.$el = document.querySelector(el);
        this.$vm = vm;

        if (this.$el) {
            // 将dom转换Fragment提高执行效率
            this.$fragment = this.node2Fragment(this.$el);
            // 开始编译
            this.compile(this.$fragment);
            // 将结果追加到宿主元素
            this.$el.appendChild(this.$fragment);
        }
    }
    /**
     * 节点转换成fragment
     * @param {*} el 宿主节点
     */
    node2Fragment(el) {
        console.log('---开始转换节点')
        // 创建fragment
        const fragment = document.createDocumentFragment();
        let child;
        // 将原生节点移动到fragment
        while (child = el.firstChild) { // firstChild获取el下的第一个子节点
            fragment.appendChild(child);// 移动操作，一直将宿主内的元素搬空
        }
        return fragment;
    }
    /**
     * 编译
     * @param {*} el fragment 
     */
    compile(el) {
        console.log('---开始编译')
        // 拿到子节点
        let childNodes = el.childNodes;
        // 类数组转换成数组
        Array.from(childNodes).forEach(node => {
            // 判断节点类型
            if (this.isElementNode(node)) { // 如果是元素节点，规则：x-xxx、@xxx
                this.compileElement(node);
            } else if (this.isTextNode(node) && /{{(.*)}}/.test(node.textContent)) { // 如果是文本节点，并且是双花括号文本。规则：{{xxx}}
                this.compileText(node, RegExp.$1); // RegExp.$1获取分组匹配内容，拿到的是模板上绑定的字段
            }
            // 如果存在子节点，递归再遍历
            if (node.childNodes && node.childNodes.length) {
                this.compile(node);
            }
        })
    }
    /**
     * 编译元素节点
     * @param {*} node 
     */
    compileElement(node) {
        // 规则 <div x-text="name" @click="onClick" >
        const attrs = node.attributes; // 拿到属性
        Array.from(attrs).forEach(attr => {
            // 属性名称 x-text
            const name = attr.name;
            // 绑定字段 name
            const field = attr.value;
            if (this.isDirective(name)) { // 如果是指令
                // 拿到x-text中的text
                const dir = name.substr(2);
                // 执行，如调用 this.text()
                this[dir] && this[dir](node, this.$vm, field);
            } else if (this.isEvent(name)) { // 如果是事件
                // 拿到@click中的click
                const dir = name.substr(1);
                this.eventHandler(node, this.$vm, field, dir);
            }
        })
    }
    /**
     * 编译文本 
     * @param {*} node 节点
     * @param {*} field 字段
     */
    compileText(node, field) {
        this.text(node, this.$vm, field);
    }

    /**
     * 处理文本
     * @param {*} node 
     * @param {*} vm 
     * @param {*} field 
     */
    text(node, vm, field) {
        this.update(node, vm, field, 'text');
    }
    /**
     * 处理html
     * @param {*} node 
     * @param {*} vm 
     * @param {*} field 
     */
    html(node, vm, field) {
        this.update(node, vm, field, 'html');
    }
    /**
     * 处理双向绑定
     * @param {*} node 
     * @param {*} vm 
     * @param {*} field 
     */
    model(node, vm, field) {
        this.update(node, vm, field, 'model');
        // 处理视图更新数据
        node.addEventListener('input', e => { // 监听input事件
            vm[field] = e.target.value;
        })
    }
    /**
     * 更新
     * @param {*} node 
     * @param {*} vm 
     * @param {*} field 
     * @param {*} type 类型
     */
    update(node, vm, field, type) {
        let updaterFn = this[type + 'Updater'];
        // 立刻执行一次
        updaterFn && updaterFn(node, vm[field]);
        new Watcher(vm, field, function(value){
            updaterFn && updaterFn(node, value);
        })
    }
    /**
     * 设置文本
     * @param {*} node 
     * @param {*} value 
     */
    textUpdater(node, value) {
        node.textContent = value;
    }

    /**
     * 设置html
     * @param {*} node 
     * @param {*} value 
     */
    htmlUpdater(node, value) {
        node.innerHTML = value;
    }

    /**
     * 设置input的value
     * @param {*} node 
     * @param {*} value 
     */
    modelUpdater(node, value) {
        node.value = value;
    }

    /**
     * 事件指令处理
     * @param {*} node 
     * @param {*} vm 
     * @param {*} field 
     * @param {*} eName 事件名称
     */
    eventHandler(node, vm, field, eName) {
        const fn = vm.$options.methods && vm.$options.methods[field];
        if (fn && eName) {
            node.addEventListener(eName, fn.bind(vm), false);
        }
    }

    /**
     * 如果是指令
     * @param {*} name 
     */
    isDirective(name) {
        return name.indexOf('x-') === 0;
    }

    /**
     * 如果是事件
     * @param {*} name 
     */
    isEvent(name) {
        return name.indexOf('@') === 0;
    }

    /**
     * 是否元素节点
     * @param {*} node 
     */
    isElementNode(node) {
        return node.nodeType === 1; // 元素节点类型1
    }

    /**
     * 是否文本节点
     * @param {*} node 
     */
    isTextNode(node) {
        return node.nodeType === 3; // 文本节点类型3
    }
}