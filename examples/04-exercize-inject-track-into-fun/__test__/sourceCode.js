import { tracker } from "tracker";
import tracker2 from "tracker";
import * as tracker3 from "tracker";
import aa from "aa";
import * as bb from "bb";
import { cc } from "cc";
import "dd";

/* function 生命式 */
function a() {
  console.log("aaa");
}

/* function 变量式 */
const d = function () {
  console.log("ddd");
};

/* function 无函数体 */
const c = () => "ccc";

/* 类 */
class B {
  bb() {
    return "bbb";
  }
}
