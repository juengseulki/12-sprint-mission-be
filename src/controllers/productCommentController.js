import prisma from "../lib/prisma.js";

export async function createProductComment(req, res) {
  try {
    const productId = Number(req.params.id);
    const { content } = req.body;

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        message: "올바르지 않은 상품 id입니다.",
      });
    }

    if (!content) {
      return res.status(400).json({
        message: "content를 입력해주세요.",
      });
    }

    const comment = await prisma.productComment.create({
      data: {
        content,
        productId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        productId: true,
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);

    if (error.code === "P2003") {
      return res.status(404).json({
        message: "상품을 찾을 수 없습니다.",
      });
    }

    res.status(500).json({ message: "댓글 등록 실패" });
  }
}

export async function getProductComments(req, res) {
  try {
    const productId = Number(req.params.id);
    const { cursor, limit = 5 } = req.query;

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        message: "올바르지 않은 상품 id입니다.",
      });
    }

    const comments = await prisma.productComment.findMany({
      where: {
        productId,
        ...(cursor ? { id: { lt: Number(cursor) } } : {}),
      },
      orderBy: { id: "desc" },
      take: Number(limit),
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        productId: true,
      },
    });

    res.status(200).json({
      list: comments,
      nextCursor: comments.length ? comments[comments.length - 1].id : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "조회 실패" });
  }
}

export async function updateProductComment(req, res) {
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

    const comment = await prisma.productComment.update({
      where: { id },
      data: { content },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        productId: true,
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

    res.status(500).json({ message: "수정 실패" });
  }
}

export async function deleteProductComment(req, res) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "올바르지 않은 댓글 id입니다.",
      });
    }

    await prisma.productComment.delete({
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
