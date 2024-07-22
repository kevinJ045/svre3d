import * as React from "react";

export function BGStars(){
  return <div className="bg-stars">
    {
      Array(75).fill(0).map((n, i) => i + 1)
      .map(
        (i) => <div className={"dotWrapper dotWrapper-"+i} key={i}>
        <div className={"dot dot-"+i}></div>
      </div>
      )
    }
  </div>
}