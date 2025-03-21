import { useState } from "react";
//import "./styles.css";
import axios from "axios";



const Messages = (props) =>{
  
   let listItems = props.messages;
  // console.log("pre - " + listItems);
   
  //listItems= listItems.replace(/(?:\r\n|\r|\n)/g, '<br>');

  //console.log("after - " + listItems);
    <h3 >{listItems}</h3>
 return  (
 
  <div>

      <h1 className="AreaTitle" style={{marginTop:"2px"}}>{props.title}</h1> 
      <div className="AreaMessageText" style={{whiteSpace:"pre-wrap",MarginTop:"1px"}}>
         {listItems}
      </div>
     </div>
 
 );
}
export default Messages
