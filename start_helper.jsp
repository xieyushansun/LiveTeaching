<%@ page contentType="text/xml" %>
<%@ page trimDirectiveWhitespaces="true" %>
<%@ include file="bbb_api.jsp" %>
<?xml version="1.0" ?>

<%
    String reqIP=request.getHeader("x-forwarded-for");
    String locIP=request.getLocalAddr();
%>


<%
    String username = request.getParameter("username");
    String meetingID = request.getParameter("meetingID");
    String joinURL = getJoinURL(username, meetingID, "false", "<br>Welcome to %%CONFNAME%%.<br>", null, null);
    joinURL = joinURL.replace("&", "&amp");



%>
<response>
<%--    <username><%= username%>></username>--%>
<%--    <meetingID><%= meetingID%></meetingID>--%>
    <joinURL><%= joinURL%></joinURL>
</response>
