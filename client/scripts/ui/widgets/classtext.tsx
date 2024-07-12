import React from "react";

export function ClassText({classname: classnameraw}){
  console.log(classnameraw);
  const classname = classnameraw.slice(0, 1).toUpperCase() + classnameraw.slice(1)
  return <span className={`classtext ${classnameraw}`}>
    {classname}
  </span>
}