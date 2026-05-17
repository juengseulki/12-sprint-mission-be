import prisma from "../lib/prisma.js";

const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  tags: true,
  image: true,
  likeCount: true,
  createdAt: true,
  updatedAt: true,
};

export async function createProduct(req, res) {
  try {
    const { name, description, price, tags, image } = req.body;

    if (!name || !description || price === undefined || price === null) {
      return res.status(400).json({
        message: "name, description, price는 필수입니다.",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        tags: Array.isArray(tags) ? tags : [],
        image: image || null,
      },
      select: productSelect,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "상품 등록 실패",
    });
  }
}

export async function getProducts(req, res) {
  try {
    const {
      offset = 0,
      limit = 10,
      keyword = "",
      orderBy = "recent",
    } = req.query;

    const where = keyword
      ? {
          OR: [
            {
              name: {
                contains: keyword,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    const orderByOption =
      orderBy === "like" ? { likeCount: "desc" } : { createdAt: "desc" };

    const products = await prisma.product.findMany({
      where,
      skip: Number(offset),
      take: Number(limit),
      orderBy: orderByOption,
      select: productSelect,
    });

    const totalCount = await prisma.product.count({ where });

    res.status(200).json({
      totalCount,
      list: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "상품 목록 조회 실패",
    });
  }
}

export async function getProductById(req, res) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "올바르지 않은 상품 id입니다.",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: productSelect,
    });

    if (!product) {
      return res.status(404).json({
        message: "상품을 찾을 수 없습니다.",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "상품 조회 실패",
    });
  }
}

export async function updateProduct(req, res) {
  try {
    const id = Number(req.params.id);
    const { name, description, price, tags, image } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "올바르지 않은 상품 id입니다.",
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(tags !== undefined
          ? { tags: Array.isArray(tags) ? tags : [] }
          : {}),
        ...(image !== undefined ? { image } : {}),
      },
      select: productSelect,
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "상품을 찾을 수 없습니다.",
      });
    }

    res.status(500).json({
      message: "상품 수정 실패",
    });
  }
}

export async function deleteProduct(req, res) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "올바르지 않은 상품 id입니다.",
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({
      message: "상품이 삭제되었습니다.",
    });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "상품을 찾을 수 없습니다.",
      });
    }

    res.status(500).json({
      message: "상품 삭제 실패",
    });
  }
}
