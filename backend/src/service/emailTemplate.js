// emailTemplate.js
const getEmailTemplate = (number) => `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>인증 이메일</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: #007bff;
                color: #ffffff;
                padding: 10px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .header h1 {
                margin: 0;
            }
            .content {
                margin: 20px 0;
                text-align: center;
            }
            .content p {
                font-size: 24px;
                font-weight: bold;
                margin: 0;
                color: #333;
            }
            .footer {
                text-align: center;
                font-size: 14px;
                color: #777;
                padding: 10px;
                border-top: 1px solid #ddd;
            }
            .footer a {
                color: #007bff;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Clubing 인증 메일</h1>
            </div>
            <div class="content">
                <p>인증번호: <strong>${number}</strong></p>
                <p>이 번호를 입력하여 인증을 완료해 주세요.</p>
            </div>
        </div>
    </body>
    </html>
`;

module.exports = getEmailTemplate;
