const ProductModel = require('../models/ProductModel');


async function getAllProducts() {
    return ProductModel.find({ closed: false }).lean();
    // return Play.find({ isPublic: true }).sort({ cratedAt: -1 }).lean();
    // показваме само isPublic да се вижда в Каталога и ги сортираме по най-новите създадени
}

async function getProductAndBidsID(userId) {
    return ProductModel.findById(userId).populate('owner').populate('bidder').lean();
}

async function getProductById(productId) {
    return ProductModel.findById(productId).lean();

    // return await Book.findById(bookId).populate('usersLiked').lean();
    // .populate('usersLiked') -->> когато искаме да извадим масива с usersLiked (кои id-та са харесали пиесата)
}


async function createProduct(productData) {
    // const result = await Play.create({ ...playData, owner: ownerId });

    // Проверка за недублиране на имена на заглавията
    const pattern = new RegExp(`^${productData.title}$`, 'i');
    const existing = await ProductModel.findOne({ title: { $regex: pattern } });

    if (existing) {
        throw new Error('A theater play with this name already exists');
    }

    const result = new ProductModel(productData);
    await result.save();
    return result;
}

async function editProduct(productId, currEditProduct) {
    const existing = await ProductModel.findById(productId);

    existing.title = currEditProduct.title;
    existing.description = currEditProduct.description;
    existing.category = currEditProduct.category;
    existing.image = currEditProduct.image;

    if (!existing.bidder) {
        existing.price = currEditProduct.price;
    }

    return existing.save();

    // same as above
    // await Game.findByIdAndUpdate(gameId, gameData);
    // findByIdAndUpdate - заобикаля валидациите
}


async function deleteById(productId) {
    return ProductModel.findByIdAndDelete(productId);
}



async function makeABidder(productId, userId) {
    const existing = await ProductModel.findById(productId);

    if (existing.bidder.includes(userId)) {
        throw new Error('Cannot Bid twice');
    }

    existing.bidder.push(userId);
    return existing.save();
}

async function placeBid(productId, amount, userId) {
    const existingProduct = await ProductModel.findById(productId);

    if (existingProduct.bidder == userId) {
        throw new Error('You are already the highest bidder');
    } else if (existingProduct.owner == userId) {
        throw new Error('You cannot bid for your own auction!');
    } else if (amount <= existingProduct.price) {
        throw new Error('Your bid must be higher than the current price');
    }

    existingProduct.bidder = userId;
    existingProduct.price = amount;

    await existingProduct.save();
}

async function closeAuction(id) {
    const existingProduct = await ProductModel.findById(id);

    if (!existingProduct.bidder) {
        throw new Error('Cannot close auction without bidder!');
    }

    existingProduct.closed = true;
    await existingProduct.save();
}

// Filter closed offer form owner and populate bidder
async function getAuctionsByUser(userId) {
    return ProductModel.find({ owner: userId, closed: true }).populate('bidder').lean();
}


module.exports = {
    getAllProducts,
    createProduct,
    getProductById,
    deleteById,
    makeABidder,
    placeBid,
    editProduct,
    getProductAndBidsID,
    closeAuction,
    getAuctionsByUser
};






// async function sortByLikes(orderBy) {
//     return ProductModel.find({ isPublic: true }).sort({ usersLiked: 'desc' }).lean();
// }



// async function buyGame(userId, gameId) {
//     const game = await Play.findById(gameId);
//     game.buyers.push(userId);
//     return game.save();

//     // same as
//     // Game.findByIdAndUpdate(gameId, { $push: { buyers: userId } });
// }





// async function search(cryptoName, paymentMethod) {
//     let crypto = await Game.find({}).lean();

//     if(cryptoName) {
//         crypto = crypto.filter(x => x.cryptoName.toLowerCase() == cryptoName.toLowerCase())
//     }

//     if(paymentMethod) {
//         crypto = crypto.filter(x => x.paymentMethod == paymentMethod)
//     }

//     return crypto;
// }
