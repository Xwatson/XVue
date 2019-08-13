# XVue
一个粗糙的vue框架demo

## 已实现
- [x] 双花括号绑定
- [x] x-name指令绑定
- [x] @click事件绑定
- [x] x-model双向绑定
- [ ] x-bind
- [ ] :name
- [ ] x-on:click
- [ ] ...
 
## 实现的类
- XVue 框架类
- Dep 依赖管理类
- Watcher 更新类
- Compile 编译类

## demo
``` html
<div id="app">
        {{name}}
        <h3 x-text="name"></h3>
        <p>
            <input type="text" x-model="name" />
        </p>
        <p x-html="html"></p>
        <p>
            <button @click="onClick">点击我</button>
        </p>
    </div>
    <script src="./lib/xvue.js"></script>
    <script src="./lib/compile.js"></script>
    <script>
        const xv = new XVue({
            el: '#app',
            data: {
                name: 'xwatson',
                foo: {
                    bar: 'bar'
                },
                html: '<i>我是html<i>'
            },
            methods: {
                onClick() {
                    alert('我被点击！');
                }
            }
        })
        console.log('name值1：', xv.$data.name);
        xv.$data.name = 'xwatson-222'
        console.log('name值2：', xv.$data.name);
        console.log('bar值1：', xv.$data.foo.bar);
        xv.$data.foo.bar = 'bar-222'
        console.log('bar值2：', xv.$data.foo.bar);
    </script>
```