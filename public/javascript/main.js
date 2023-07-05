import { isLoggedIn, updateLoginStatus } from "./isLoggedIn.js";
import myPage from "./myPageButton.js";

$(document).ready(() => {
  initializePage();
  myPage();
  updateLoginStatus();
  searchBooks();
  displayBestsellers();
});

const searchBooks = () => {
  const query = document.getElementById("searchInput").value;
  const url = "/search?q=" + encodeURIComponent(query);
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (books) {
      const resultsContainer = document.getElementById("searchResults");
      if (books.message === "No books found.") {
        const noResultsMessage = document.createElement("p");
        noResultsMessage.className = "no-results";
        noResultsMessage.textContent = "찾을 수 없습니다.";
        resultsContainer.appendChild(noResultsMessage);
      } else {
        resultsContainer.innerHTML = "";
        books.forEach(x => {
          const searchResults = document.createElement("div");
          searchResults.innerHTML = `<div class="list-item">
                                      <div class="img-box">
                                      <a href="${x.link}" target="_blank">
                                        <img class="book-img" src="${x.cover}" alt="" srcset="">
                                      </div>
                                    </div>`;
          resultsContainer.append(searchResults);
        });
      }
    })
    .catch(function (error) {
      console.error("Error searching books:", error);
    });
};
const searchBtn = document.getElementById("search-btn");
searchBtn.addEventListener("click", searchBooks);

function displayBestsellers() {
  const bestsellersList = document.getElementById("bestsellersList");
  fetch("/bestsellers")
    .then(function (response) {
      return response.json();
    })
    .then(function (bestsellers) {
      if (bestsellers && bestsellers.length > 0) {
        bestsellers.forEach(book => {
          const bestsellerItem = document.createElement("div");
          bestsellerItem.innerHTML = `<div class="list-item">
                                        <div class="img-box">
                                          <a href="${book.link}" target="_blank">
                                            <img class="book-img" src="${book.cover}" alt="" srcset="">
                                          </a>
                                        </div>
                                      </div>`;
          bestsellersList.append(bestsellerItem);
        });
      } else {
        const noBestsellersMessage = document.createElement("li");
        noBestsellersMessage.className = "bestsellers-item";
        noBestsellersMessage.textContent = "찾을 수 없습니다.";
        bestsellersList.appendChild(noBestsellersMessage);
      }
    })
    .catch(function (error) {
      console.error("Error fetching bestsellers:", error);
    });
}

function generatePostCards(posts, postsList) {
  posts.forEach(post => {
    const userId = post.UserId;
    fetch(`/api/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(data => {
        let userNickname = data.nickname;
        let postImg = post.img;

        if (!postImg) {
          postImg = "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";
        }

        const postResult = document.createElement("div");
        postResult.innerHTML = `<div class="item" >
                              <div class="front">
                                <img src="${postImg}"/>
                              </div>
                              <div class="movie-info">
                                <h2>${post.title}</h2>
                                <h3 data-user-id=${post.UserId} >${userNickname}</h3>
                              </div>
                            </div>`;
        postResult.addEventListener("click", function (e) {
          if (e.target.hasAttribute("data-user-id")) {
            //닉네임 클릭 시 개인 페이지로
            window.location.href = `/profile/${post.UserId}`;
          } else {
            window.location.href = `/posts/${post.postId}`;
          }
          // 이미지 클릭 시 상세 페이지로 이동하는 로직을 작성합니다.
        });
        postsList.append(postResult);
      });
  });
}

function displayPosts() {
  const postsList = document.getElementById("posts-list");
  fetch("/api/posts")
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      const { posts } = response;

      if (posts) {
        generatePostCards(posts, postsList);
      } else {
        var noPostsMessage = document.createElement("li");
        noPostsMessage.className = "no-results";
        noPostsMessage.textContent = "게시글이 없습니다.";
        postsList.appendChild(noPostsMessage);
      }
    })
    .catch(function (error) {
      console.error("Error fetching posts:", error);
    });
}

async function displayFollowingPosts() {
  const postsList = document.getElementById("posts-list");
  let data = await isLoggedIn();
  let userId = data.user.id;

  fetch(`/api/users/${userId}/following-posts`)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      const { posts } = response;
      if (posts) {
        generatePostCards(posts, postsList);
      } else {
        var noPostsMessage = document.createElement("li");
        noPostsMessage.className = "no-results";
        noPostsMessage.textContent = "게시글이 없습니다.";
        postsList.appendChild(noPostsMessage);
      }
    })
    .catch(function (error) {
      console.error("Error fetching posts:", error);
    });
}

const nav = document.querySelector("nav ul");

const allUserButton = document.getElementById("all-user");

async function initializePage() {
  const result = await isLoggedIn(); // 로그인 상태 확인

  if (!result.errorMessage) {
    const logoutButton = document.createElement("li");
    logoutButton.innerHTML = `<button class="logout-btn" id="logoutButton">로그아웃</button>`;
    nav.appendChild(logoutButton);

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

    allUserButton.style.display = "block"; // "모든 유저" 버튼을 보이도록 설정
    allUserButton.addEventListener("click", () => {
      window.location.href = "/allUser.html";
    });

    displayFollowingPosts(); // 로그인 상태인 경우 displayFollowingPosts() 실행
  } else {
    displayPosts(); // 비로그인 상태인 경우 displayPosts() 실행
  }
}
