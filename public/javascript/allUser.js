import myPage from "./myPageButton.js";
myPage();

function allUsers() {
  try {
    console.log("모든 유저 가져오기");
    fetch("api/users/all-users")
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        const userList = document.getElementById("user-list");
        const { usersData } = response;
        if (usersData) {
          usersData.forEach(x => {
            let profileImage = x.profileImage;
            if (!x.profileImage) {
              profileImage = "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";
            }

            const userCard = document.createElement("div");
            userCard.innerHTML = `<div id="${x.userId}" >
                                    <div class="user-card">
                                     <div class="img-box">
                                        <img src="${profileImage}" alt="" onerror="src='https://item.kakaocdn.net/do/dc9561970173c28a13654c3f14180b4b617ea012db208c18f6e83b1a90a7baa7'" />
                                    </div>
                                     <h3>${x.nickname}</h3>
                                  </div>
                                </div>`;
            userList.append(userCard);
            userCard.addEventListener("click", e => {
              const userId = userCard.firstChild.id;
              window.location.href = `/profile/${userId}`;
            });
          });
        } else {
          var noPostsMessage = document.createElement("li");
          noPostsMessage.className = "no-results";
          noPostsMessage.textContent = "게시글이 없습니다.";
          userList.appendChild(noPostsMessage);
        }
      })
      .catch(function (error) {
        console.error("Error fetching posts:", error);
      });
  } catch (error) {
    console.log(error);
  }
}

allUsers();

const logoutButtonElement = document.getElementById("logoutButton");

logoutButtonElement.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result.message);
      // 로그아웃 성공 시 페이지 리로드 또는 다른 동작 수행
      window.location.href = "/";
    } else {
      const result = await response.json();
      console.log(result.errorMessage);
    }
  } catch (error) {
    console.error(error);
  }
});
