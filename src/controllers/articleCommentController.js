import prisma from "../lib/prisma.js";

export async function createArticleComment(req, res) {
  try {
    const articleId = Number(req.params.id);
    const { content } = req.body;

    if (Number.isNaN(articleId)) {
      return res.status(400).json({
        message: "올바르지 않은 게시글 id입니다.",
      });
    }

    if (!content) {
      return res.status(400).json({
        message: "content를 입력해주세요.",
      });
    }

    const comment = await prisma.articleComment.create({
      data: {
        content,
        articleId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        articleId: true,
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);

    if (error.code === "P2003") {
      return res.status(404).json({
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    res.status(500).json({ message: "댓글 등록 실패" });
  }
}

export async function getArticleComments(req, res) {
  try {
    const articleId = Number(req.params.id);
    const { cursor, limit = 5 } = req.query;

    if (Number.isNaN(articleId)) {
      return res.status(400).json({
        message: "올바르지 않은 게시글 id입니다.",
      });
    }

    const comments = await prisma.articleComment.findMany({
      where: {
        articleId,
        ...(cursor ? { id: { lt: Number(cursor) } } : {}),
      },
      orderBy: { id: "desc" },
      take: Number(limit),
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        articleId: true,
      },
    });

    res.status(200).json({
      list: comments,
      nextCursor: comments.length ? comments[comments.length - 1].id : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "댓글 조회 실패" });
  }
}

export async function updateArticleComment(req, res) {
  try {
    const id = Number(req.params.id);
    const { content } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "올바르지 않은 댓글 id입니다.",
      });
    }

    if (!content) {
      return res.status(400).json({
        message: "content를 입력해주세요.",
      });
    }

    const comment = await prisma.articleComment.update({
      where: { id },
      data: { content },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        articleId: true,
      },
    });

    res.status(200).json(comment);
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "댓글을 찾을 수 없습니다.",
      });
    }

    res.status(500).json({ message: "댓글 수정 실패" });
  }
}

export async function deleteArticleComment(req, res) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "올바르지 않은 댓글 id입니다.",
      });
    }

    await prisma.articleComment.delete({
      where: { id },
    });

    res.status(200).json({ message: "삭제 완료" });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "댓글을 찾을 수 없습니다.",
      });
    }

    res.status(500).json({ message: "삭제 실패" });
  }
}
