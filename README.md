* Lưu ý: các trang giao diện sẽ chia làm 2 kiểu:
1/ Trang parent sẽ include phần content vào mỗi khi chuyển hướng trên menu (ví dụ: trang dashboard có navigation bar bên trái mỗi khi click danh mục khác sẽ thay đổi phần nội dung bên trong)
2/ Trang đơn lẻ (ví dụ: các trang sign in, sign up, … nói chung là những trang không cần tận dụng lại các phần khác trong trang)

# Mình sẽ tận dụng Springboot và Thymeleaf để làm frontend với những thứ sau:
- Spring security: dùng để chặn truy cập vào những trang đòi hỏi phải đăng nhập (ví dụ: chưa đăng nhập mà vào thẳng trang dashboard thì nó sẽ đẩy sang trang đăng nhập).
- Cơ chế routing thông qua @Controller để trả về trang html, tạo controller theo:
       + Trang(pages): nếu trang đó thuộc dạng KIỂU 1 thì mỗi khi replace component là 1 endpoint.
       + Chức năng: nhóm các trang thuộc KIỂU 2 thành 1 nhóm theo chức năng để tạo controller mỗi endpoint là 1 trang trong nhóm chức năng đó.
- Cú pháp trong thymeleaf giúp replace các component trong trang (như kiểu dùng include trong php)

# Cấu trúc project:
- Mỗi trang khác nhau (theo cả 2 kiểu) lưu trong folder “pages”, nếu là KIỂU 1 thì đặt tên là tên trang parent, trang KIỂU 2 thì trang làm việc gì đặt tên đó.
- Folder “components” lưu các thành phần để replace (include) vào trang parent, những components dùng chung thì cứ đặt dưới cấp, những components thuộc 1 trang parent nào đó thì tạo folder trong “components” đặt tên là “<tên trang parent>-page”.
- Folder “css” thì cứ file css nào dùng chung thì code vô utils.css, css nào riêng của 1 trang hay components nào thì cứ phân cấp folder y như trong folder “components”.
- Folder “js” tương tự như trên.

Ví dụ:
1/ Trang dashboard là trang KIỂU 1:
- Trong dashboard có 3 danh mục trên navigation bar là “home”, “sports field”, “user profile” lưu trong “pages/dashboard.html” và ở controller sẽ truyền vào 1 Model là “content” để xác định sẽ replace nội dung nào trong 3 cái trên.
- Trang gồm 1 khung ngoài chứa navigation bar và 1 vùng để include main content dựa theo Model “content” nhận được từ controller.
- Mỗi khi chọn giả sử “sports field” thì vùng chứa main content sẽ đc replace tương ứng với component con là “components/dashboard-page/sports-field.html”

2/ Các trang như sign-in, sign-up, forgot, reset, verify là trang KIỂU 2 có cùng 1 chức năng liên quan đến authentication thì gom chung để routing trong AuthenticationController
