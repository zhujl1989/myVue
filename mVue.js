class Mvue extends EventTarget{
    constructor(options){
        super();
        this.$opts = options;        
        //编译
        this.complie();
        //监听数据变化
        this.observer(this.$opts.data);
        
    }
    observer(data){
      //观察数据变化
      let keys = Object.keys(data);
      console.log(keys)
      keys.forEach(key=>{    
          this.reactReader(data,key,data[key])
      })
    }
    reactReader(data,key,value){
       let self = this;
       Object.defineProperty(data,key,{
           configurable:true,
           enumerable:true,
           get(){              
               return value;
           },
           set(newValue){              
              let event = new CustomEvent(key,{
                  detail:newValue
              })
              self.dispatchEvent(event)
              value = newValue
           }
       })
    }
    complie(){
       let el  = document.querySelector(this.$opts.el);
       this.complieNodes(el)
    }
    complieNodes(el){
       let childNodes = el.childNodes;
       childNodes.forEach(node=>{          
           if(node.nodeType == 1){           
               //获取标签属性
               let attr = node.attributes;
               [...attr].forEach(e=>{
                   let attrName = e.name;
                   let attrValue = e.value;
                   if(attrName.indexOf("v-") == 0){
                      attrName = attrName.substr(2);
                      if(attrName == 'html'){
                        node.innerHTML = this.$opts.data[attrValue];
                      }else if(attrName == 'model'){
                        node.value = this.$opts.data[attrValue];
                        //input输入值得时候数据也需要变化
                        node.addEventListener('input',e=>{
                            this.$opts.data[attrValue] = e.target.value;
                        })
                      }
                   }
               })
               if(node.childNodes.length != 0){
                this.complieNodes(node)
               }
               
           }else if(node.nodeType == 3){
               //文本使用正则
               let erg = /\{\{\s*(\S+)\s*\}\}/
               let textContent = node.textContent;
               if(erg.test(textContent)){
                   let $1 = RegExp.$1;
                   node.textContent = node.textContent.replace(erg,this.$opts.data[$1])
                   this.addEventListener($1,e=>{
                       node.textContent = node.textContent.replace(this.$opts.data[$1],e.detail)
                   })
                }
           }
       })
    }
}
