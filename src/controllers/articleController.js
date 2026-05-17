import prisma from "../lib/prisma.js";

const articleSelect = {
  id: true,
  title: true,
  content: true,
  image: true,
  likeCount: true,
  createdAt: true,
  updatedAt: true,
};

export async function createArticle(req, res) {
  try {
    const { title, content, image } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "title과 content를 입력해주세요.",
      });
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        image: image || null,
      },
      select: articleSelect,
    });

    res.status(201).json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "게시글 등록 실패",
    });
  }
}

export async function getArticleById(req, res) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "올바르지 않은 게시글 id입니다.",
      });
    }

    const article = await prisma.article.findUnique({
      where: { id },
      select: articleSelect,
    });

    if (!article) {
      return res.status(404).json({
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    res.status(200).json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "게시글 조회 실패",
    });
  }
}

export async function updateArticle(req, res) {
  try {
    const id = Number(req.params.id);
    const { title, content, image } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "올바르지 않은 게시글 id입니다.",
      });
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(image !== undefined ? { image } : {}),
      },
      select: articleSelect,
    });

    res.status(200).json(article);
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    res.status(500).json({
      message: "게시글 수정 실패",
    });
  }
}

export async function deleteArticle(req, res) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "올바르지 않은 게시글 id입니다.",
      });
    }

    await prisma.article.delete({
      where: { id },
    });

    res.status(200).json({
      message: "게시글이 삭제되었습니다.",
    });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    res.status(500).json({
      message: "게시글 삭제 실패",
    });
  }
}

export async function getArticles(req, res) {
  try {
    const {
      offset = 0,
      limit = 10,
      keyword = "",
      orderBy = "recent",
    } = req.query;

    const where = keyword
      ? {
          title: {
            contains: keyword,
            mode: "insensitive",
          },
        }
      : {};

    const orderByOption =
      orderBy === "like" ? { likeCount: "desc" } : { createdAt: "desc" };

    const articles = await prisma.article.findMany({
      where,
      skip: Number(offset),
      take: Number(limit),
      orderBy: orderByOption,
      select: articleSelect,
    });

    const totalCount = await prisma.article.count({ where });

    res.status(200).json({
      totalCount,
      list: articles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "게시글 목록 조회 실패",
    });
  }
}
