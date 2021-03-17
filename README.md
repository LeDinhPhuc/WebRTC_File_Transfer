# WebRTC_File_Transfer

### - Cấu trúc gói tin RTCDataChannel

<table>
  <th> Thành phần </th>
  <th> Độ dài (bytes)</th>
  <th> Type </th>
  <th> Mô tả </th>
  <tbody>
    <tr>
      <td><b> Code </b></td>
      <td align="center"> 1 </td> 
      <td> Number </td>
      <td> Mã cmd </td>
    </tr>
    <tr>
      <td><b> ContentType </b></td>
      <td align="center"> 1 </td> 
      <td> Number </td>
      <td> Kiểu dữ liệu </td>
    </tr>
    <tr>
      <td><b> ContentLength </b></td>
      <td align="center"> 4 </td> 
      <td> Number </td>
      <td> Kích thước dữ liệu (bytes) </td>
    </tr>
    <tr>
      <td><b> ContentData </b></td>
      <td align="center"> contentLength </td> 
      <td> ArrayBuffer </td>
      <td> Dữ liệu dạng buffer </td>
    </tr>
    <tr>
      <td><b> PeerId </b></td>
      <td align="center"> 24 </td> 
      <td> String </td>
      <td> ID của người gửi </td>
    </tr>
  </tbody>
</table>
