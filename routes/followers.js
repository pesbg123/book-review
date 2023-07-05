const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const { Followers, Posts } = require("../models"); // 팔로워 모델과 사용자 모델을 가져옵니다.

// 사용자 팔로워 목록 조회 API
router.get("/users/:userId/followers", async (req, res) => {
  try {
    const userId = req.params.userId;
    const getFollowers = await Followers.findAll({ where: { followingId: userId } });

    res.status(200).json({ getFollowers });
  } catch (error) {
    res.status(400).json({ errorMessage: "알 수 없는 에러가 발생했습니다." });
  }
});

// 팔로우 API
router.post("/users/:targetUserId/follow", authMiddleware, async (req, res) => {
  try {
    // 팔로우 대상 userId
    const targetUserId = parseInt(req.params.targetUserId);
    // 팔로우를 하는 유저 userId
    const followerId = res.locals.user.dataValues.userId;

    // 본인인 경우 에러 응답 반환
    if (followerId === targetUserId) {
      return res.status(400).json({ errorMessage: "본인을 팔로우할 수 없습니다." });
    }

    // 팔로워 관계 조회
    const existingFollowers = await Followers.findAll({
      where: {
        followerId,
        followingId: targetUserId
      }
    });

    // 이미 팔로우한 경우
    if (existingFollowers.length > 0) {
      return res.status(400).json({ errorMessage: "이미 팔로우한 사용자입니다." });
    }

    // 팔로워 관계 생성
    await Followers.create({
      followerId,
      followingId: targetUserId
    });

    res.status(200).json({ message: "팔로우를 성공 했습니다." });
  } catch (error) {
    res.status(400).json({ errorMessage: "알 수 없는 에러가 발생했습니다." });
  }
});

// 언팔로우 API
router.delete("/users/:targetUserId/unfollow", authMiddleware, async (req, res) => {
  try {
    // 언팔로우 대상 userId
    const targetUserId = parseInt(req.params.targetUserId);
    // 언팔로우를 하는 유저 userId
    const followerId = res.locals.user.dataValues.userId;
    // 팔로워 관계 조회
    const existingFollowers = await Followers.findOne({
      where: {
        followerId,
        followingId: targetUserId
      }
    });
    // 팔로우 하지 않은 상대를 언팔로우 할 경우 에러 응답 반환
    if (!existingFollowers) {
      return res.status(400).json({ errorMessage: "팔로우를 한 상대가 아닙니다." });
    }
    // 본인인 경우 에러 응답 반환
    if (followerId === targetUserId) {
      return res.status(400).json({ errorMessage: "본인을 언팔로우할 수 없습니다." });
    }

    // 언팔로우 관계 삭제
    await Followers.destroy({
      where: {
        followerId,
        followingId: targetUserId
      }
    });

    res.status(200).json({ message: "언팔로우를 성공했습니다." });
  } catch (error) {
    res.status(400).json({ errorMessage: "알 수 없는 에러가 발생했습니다." });
  }
});

// 팔로우한 유저의 게시글 조회 API
router.get("/users/:userId/following-posts", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const following = await Followers.findAll({ where: { followerId: userId } });
    const followingIds = following.map(follow => follow.followingId);

    const posts = await Posts.findAll({
      where: { UserId: followingIds },
      attributes: ["postId", "UserId", "nickname", "title", "content", "createdAt", "updatedAt", "img"],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({ posts });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(400).json({ errorMessage: "게시글 조회에 실패했습니다." });
  }
});

module.exports = router; // router 모듈을 외부로 내보냅니다.
