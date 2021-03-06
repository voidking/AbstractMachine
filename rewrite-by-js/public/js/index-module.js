$(function(){

    var index_module = {
        // 定义规则
        rule: {
            CONS: '常量规则：(vs, const(c):e, sita) => (c:vs, e, sita)',

            VAR: '变量规则：(vs, var(c):e, sita) => (sita(x):vs, e, sita)',

            DEV: '除法规则：(n1:n2:vs, div:e, sita) => (n:vs, e, sita), n= n1/n2',

            MUL: '乘法规则：(n1:n2:vs, mul:e, sita) => (n:vs, e, sita), n= n1*n2',

            ADD: '加法规则：(n1:n2:vs, add:e, sita) => (n:vs, e, sita), n= n1+n2',

            SUB: '减法规则：(n1:n2:vs, sub:e, sita) => (n:vs, e, sita), n= n1-n2',

            SE: '比较规则：(n1:n2:vs, se:e, sita) => (n:vs, e, sita), n = (n1<=n2)',

            GE: '比较规则：(n1:n2:vs, ge:e, sita) => (n:vs, e, sita), n = (n1>=n2)',

            OP: '分解规则:(vs, op(e1,e2):e, sita) => (vs, e2:e1:op:e, sita)'
        },

        // 初始化
        init: function(){

            //初始赋值
            window.control = '[ge(add(var(x),mul(cons(2),var(y))),var(z))]';
            //window.control = 'var(z),add(var(x),mul(cons(2),var(y))),ge';
            window.partone = '';
            window.denv = '[x->34, y->7, z->50]';
            window.denv_obj = {};
            window.stack_arr = [];
            window.result = 0;

            //格式化初始值
            window.control = this.clear_bracket(window.control);
            window.partone = this.get_global_partone(window.control);
            window.parttwo = this.get_global_parttwo(window.control);
            window.denv_obj = this.get_denv_obj(denv);
        },
        // 去掉中括号[]
        clear_bracket: function(control){
            var firstChar = control.substring(0, 1);
            if(firstChar=='['){
                control = control.substring(1,control.length-1);
            }
            //console.log(control);
            return control;
        },
        //得到全局第一部分
        get_global_partone: function(control){
            var len = control.length;
            var i = 0;
            var ret = '';
            var flag = 0;
            while(i < len && control.charAt(i) == ' '){
               i++; 
            } 
            while(i < len && (control.charAt(i) != ',' || flag != 0)) {
                ret += control.charAt(i);
                if(control.charAt(i) == '(') flag ++;
                if(control.charAt(i) == ')') flag --;
                i ++;
            }
            return ret;
        },
        //得到全局第二部分
        get_global_parttwo: function(control){
            var len = control.length;
            var i = 0;

            var flag = 0;
            while(i < len && control.charAt(i) == ' ') i ++;
            while(i < len && (control.charAt(i) != ',' || flag != 0)) {
                if(control.charAt(i) == '(') flag ++;
                if(control.charAt(i) == ')') flag --;
                i ++;
            }
            i ++;
            while(i < len && control.charAt(i) == ' '){
               i ++; 
            } 
            var ret = '';
            while(i < len ) {
                ret += control.charAt(i);
                i ++;
            }
            return ret;
        },
        // 转化denv为对象
        get_denv_obj: function(denv){
            var denv = this.clear_bracket(denv);
            //console.log(denv);
            var denv_arr = denv.split(',');
            //console.log(denv_arr[0]);
            var denv_obj={};
            for(var i=0;i<denv_arr.length;i++){
                var entry = denv_arr[i].trim();
                var key = entry.split('->')[0];
                var value = entry.split('->')[1];
                denv_obj[key]=value;
            }
            return denv_obj;
        },
        //得到操作符
        get_opration: function(control){
            var reg=/\w+/;
            var operation = control.match(reg)[0];
            //console.log(operation);
            return operation;
        },
        //得到第一部分
        get_partone: function(control) {
            var len = control.length;
            var i = 0;
            // 跳过操作符和(
            while(i < len && control.charAt(i) != '('){
               i ++; 
            } 
            i ++;
            var ret = '';
            var flag = 0;
            while(i < len && control.charAt(i) == ' '){
               i++; 
            } 
            while(i < len && (control.charAt(i) != ',' || flag != 0)) {
                ret += control.charAt(i);
                if(control.charAt(i) == '(') flag ++;
                if(control.charAt(i) == ')') flag --;
                i ++;
            }
            return ret;
        },

        //得到第二部分
        get_parttwo: function(control) {
            var len = control.length;
            var i = 0;
            while(i < len && control.charAt(i) != '('){
               i ++; 
            } 
            i ++;

            var flag = 0;
            while(i < len && control.charAt(i) == ' ') i ++;
            while(i < len && (control.charAt(i) != ',' || flag != 0)) {
                if(control.charAt(i) == '(') flag ++;
                if(control.charAt(i) == ')') flag --;
                i ++;
            }
            i ++;
            while(i < len && control.charAt(i) == ' '){
               i ++; 
            } 
            var ret = '';
            while(i < len - 1) {
                ret += control.charAt(i);
                i ++;
            }
            return ret;
        },
        //得到新的control
        get_new_control: function(control){
            var operation = this.get_opration(control);
            var partone = this.get_partone(control);
            var parttwo = this.get_parttwo(control);
            //console.log(partone);
            //console.log(parttwo);
            var new_control = parttwo+','+partone+','+operation;
            
            return new_control;
        },
        // 进行一步计算
        one_step: function(){
            if(window.control == window.partone){
                //例如ge(add(var(x),mul(cons(2),var(y))),var(z))
                //例如ge
                this.control_equals_partone();   
            }else{
                //例如var(z),add(var(x),mul(cons(2),var(y))),ge
                //例如mul,var(x),add,ge
                this.control_not_equals_partone();
            }
        },
        control_equals_partone: function(){
            var operation = this.get_opration(window.control);
            //判断是否需要出栈进行运算
            //ge、add、mul需要出栈，cons()、var()、ge()、add()、mul()不需要出栈
            if(operation==window.partone){
                var len = window.stack_arr.length;
                var first = window.stack_arr[len-1];
                var second = window.stack_arr[len-2];
                switch(operation){
                    case 'ge':
                        console.log(this.rule.GE);
                        window.result = (first>=second)? true: false;
                        break;
                    case 'add':
                        console.log(this.rule.ADD);
                        window.result = first+second;
                        break;
                    case 'mul':
                        console.log(this.rule.MUL);
                        window.result = first*second;
                        break;
                    default:
                        break;
                }
                //删除指定元素
                window.stack_arr.splice(len-1);
                window.stack_arr.splice(len-2);
                //添加最新元素
                len = window.stack_arr.length;
                window.stack_arr[len] = window.result;

                window.control = this.get_global_parttwo(window.control);
                window.partone = this.get_global_partone(window.control);
            }else{
                console.log(this.rule.OP);
                var new_control = this.get_new_control(window.control);
                window.control = new_control;
                window.partone = this.get_global_partone(window.control);
            } 
        },
        control_not_equals_partone: function(){
            var operation = this.get_opration(window.control);
            //判断是否需要出栈进行运算
            //ge、add、mul需要出栈，cons()、var()、ge()、add()、mul()不需要出栈
            if(operation==window.partone){
                var len = window.stack_arr.length;
                var first = window.stack_arr[len-1];
                var second = window.stack_arr[len-2];
                switch(operation){
                    case 'ge':
                        console.log(this.rule.GE);
                        window.result = (first>=second)? true: false;
                        break;
                    case 'add':
                        console.log(this.rule.ADD);
                        window.result = first+second;
                        break;
                    case 'mul':
                        console.log(this.rule.MUL);
                        window.result = first*second;
                        break;
                    default:
                        break;
                }
                //删除指定元素
                window.stack_arr.splice(len-1);
                window.stack_arr.splice(len-2);
                //添加最新元素
                len = window.stack_arr.length;
                window.stack_arr[len] = window.result;

                window.control = this.get_global_parttwo(window.control);
                window.partone = this.get_global_partone(window.control);

            }else{
                if(operation == 'cons'){
                    var first = control.split(',')[0];
                    //console.log(first);
                    var reg = /\d+/ ;
                    var num = first.match(reg)[0];
                    //console.log(num);
                    var len = window.stack_arr.length;
                    window.stack_arr[len]=Number(num);
                    window.control = control.slice(first.length+1,window.control.length).trim();
                    window.partone = this.get_global_partone(window.control);
                    
                }else if(operation == 'var'){
                    var first = control.split(',')[0];
                    //console.log(first);
                    var reg = /\(\w+\)/ ;
                    var variable = first.match(reg)[0];
                    variable = variable.substring(1,variable.length-1);
                    //console.log(variable);
                    var len = window.stack_arr.length;
                    window.stack_arr[len]=Number(denv_obj[variable]);
                    //console.log(stack_arr[len]);
                    window.control = control.slice(first.length+1,window.control.length).trim();
                    window.partone = this.get_global_partone(window.control);
                }else{
                    console.log(this.rule.OP);
                    var new_control = this.get_new_control(window.partone);
                    new_control = new_control +','+ this.get_global_parttwo(window.control);
                    window.control = new_control;
                    window.partone = this.get_global_partone(window.control);
                }
            }
        },
        run: function(){
            console.log('初始状态为：');
            console.log(window.control);
            console.log(window.partone);
            console.log(window.stack_arr);
            var i=0;
            while(window.control != ''){
                i++;
                console.log('第'+i+'步执行结果为：');
                this.one_step(window.control);
                console.log(window.control);
                console.log(window.partone);
                console.log(window.stack_arr);
            }
        }
    };
    

    index_module.init();
    index_module.run();
});