import styled from "styled-components";
/*
npm install styled-components
*/
import One from "../icon/One";
import Two from "../icon/Two";
import { IconWrap } from "../stylesjs/Content.styles";
import Three from "../icon/Three";
import Four from "../icon/Four";
import Five from "../icon/Five";
import Six from "../icon/Six";
import Seven from "../icon/Seven";

const SidebarWrapper = styled.div`
width:80px;
height:100%;
display:flex;
flex-direction:column;
position:fixed;
right:0; top:0;
justify-content:flex-end;
align-items:center;
z-index:999999;
background-color:hotpink;

@media (max-width:768px) {
display:none;
}
`;//position:fixed 는 언제든 포지션 고정 

const Icon = styled.img`
width:32px; height:32px;
position:relative;
margin-top:10px;
`;

const SideBar = () => {
    return(
        <>
        <SidebarWrapper>
        <IconWrap>
            <One/>
        </IconWrap>
        <IconWrap>
            <Two/>
        </IconWrap>
        <IconWrap>
            <Three/>
        </IconWrap>
        <IconWrap>
            <Four/>
        </IconWrap>
        <IconWrap>
            <Five/>
        </IconWrap>
        <IconWrap>
            <Six/>
        </IconWrap>
        <IconWrap>
            <Seven/>
        </IconWrap>
        </SidebarWrapper>
        </>
    )
}
export default SideBar;