function aa(){
  return new Promise((resolve, reject) => {
          console.log("宏任务1");
          resolve(1)
      }).then(() => {
          new Promise((resolve, reject) => {
              console.log("宏任务2");
              resolve()
          }).then(() => {
              console.log(3);
          }).then(() => {
              console.log(4);
          }).then(() => {
              console.log(6);
          }).then(() => {
              console.log(7);
          }).then(() => {
              console.log(12);
          })

          return new Promise((resolve, reject) => {
              console.log("宏任务3");
              resolve(33)
          })

      }).then((d) => { // 这个then()什么时候加入到任务队列的
          console.log("宏任务:",d)
          console.log(8);
      }).then(() => {
          console.log(9);
      }).then(() => {
          console.log(10);
      }).then(() => {
          console.log(11);
      })
}
aa()