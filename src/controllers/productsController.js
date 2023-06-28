const router = require('express').Router();

// SESSION COOKIES
// const { isUser, isOwner } = require('../middleware/guards');
// const preload = require('../middleware/preload');

const { isAuth } = require('../middleware/userSession');
const { getAllProducts, createProduct, getProductById, deleteById, placeBid, editProduct, getProductAndBidsID, closeAuction, getAuctionsByUser } = require('../services/productService');
const mapErrors = require('../util/mapError');
const preload = require('../middleware/preload');



router.get('/create', isAuth, (req, res) => {
    res.render('create', { title: 'Create Book Review', data: {} });
});

router.post('/create', isAuth, async (req, res) => {
    const productData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        image: req.body.image,
        price: Number(req.body.price),
        owner: req.user._id,
    };

    try {
        if (Object.values(productData).some(v => !v)) {
            throw new Error('All fields are required');
        }

        await createProduct(productData);
        res.redirect('/catalog');

    } catch (err) {
        // re-render create page
        console.error(err);
        const errors = mapErrors(err);
        return res.status(400).render('create', { title: 'Create Product', data: productData, errors });
    }
});


// CATALOG
// router.get('/catalog') -->> /catalog -> вземаме от main.hbs // browser address bar 
router.get('/catalog', async (req, res) => {
    const products = await getAllProducts();
    // console.log(products);
    res.render('catalog', { title: 'Auction Products Catalog', products });

    //SORTING by Likes and date
    // if(req.query.orderBy == 'likes') {
    //     const plays = await sortByLikes(req.query.orderBy);
    //     res.render('catalog', { title: 'Theater Catalog', plays });

    // } else {
    //     const plays = await getAllPlays();
    //     res.render('catalog', { title: 'Theater Catalog', plays });
    // }

    // рендерираме res.render('catalog') -->> вземамe от views -> catalog.hbs

    // test with empty array
    // res.render('catalog', { title: 'Shared Trips', trips: [] });
});



router.get('/catalog/:id/details/', preload(true), isAuth, async (req, res) => {
    const auction = res.locals.auction;
    //console.log(auction);

    const categories = {
        estate: 'Real Estate',
        vehicles: 'Vehicles',
        furniture: 'Furniture',
        electronics: 'Electronics',
        other: 'Other'
    };
    auction.category = categories[auction.category];

    auction.ownerName = `${auction.owner.firstName} ${auction.owner.lastName}`;

    if (req.user._id) {
        auction.hasUser = true;
        auction.isOwner = req.user._id == auction.owner._id;
        auction.canBid = !auction.isOwner && req.user._id != auction.bidder?._id;
    }
    

    try {
        const currProduct = await getProductById(req.params.id);

        // Not working 100%
        // const isOwner = currProduct.owner == req.user?._id;
        // const hasBidder = currProduct.bidder?.some(id => id != req.user?._id);
        // const canBid = currProduct.owner != req.params.bidder?._id;
        
        // My function
        // const productWithOwnerInfo = await getProductAndBidsID(req.params.id);
        // res.locals.productOwner = productWithOwnerInfo;
        // const firstName = res.locals.productOwner?.owner.firstName;
        // const lastName = res.locals.productOwner?.owner.lastName;
        // const bidderFirstName = res.locals.productOwner?.bidder[0].firstName;
        // const bidderLastName = res.locals.productOwner?.bidder[0].lastName;
        // console.log(res.locals.productOwner);


        res.render('details', { title: 'Product Details', currProduct });

    } catch (err) {
        console.log(err.message);
        res.redirect('/404');
    }
});



// router.get('/catalog/:id/buy', isAuth, async (req, res) => {
//     await buyGame(req.user._id, req.params.id);

//     res.redirect(`/catalog/${req.params.id}/details`);
// });




router.get('/catalog/:id/edit', isAuth, async (req, res) => {
    const hasBids = res.locals.productOwner.bidder;
    try {
        const currProduct = await getProductById(req.params.id);

        if (currProduct.owner != req.user._id) {
            throw new Error('Cannot edit Book that you are not owner');
        }

        // const categoryMethodMap = {
        //     "vehicles": 'Vehicles',
        //     "estate": 'Real Estate',
        //     "electronics": 'Electronics',
        //     "furniture": 'Furniture',
        //     "other": 'Other',
        // };
    
        // const categoryMethod = Object.keys(categoryMethodMap).map(key => ({
        //     value: key, 
        //     label: categoryMethodMap[key] ,
        //     isSelected: currProduct.category == key
        // }));

        res.render('edit', { title: 'Edit Product', currProduct, hasBids });

    } catch (err) {
        console.log(err.message);
        res.redirect(`/catalog/${req.params.id}/details`);
    }


    // в edit.hbs в action="/catalog/{{currGame._id}}/edit"  поставяме currGame._id, което е: _id: new ObjectId("647650d43addd63fbb6d6efd"),
});


router.post('/catalog/:id/edit', isAuth, async (req, res) => {
    const currProduct = await getProductById(req.params.id);
    
    if (currProduct.owner != req.user._id) {
        throw new Error('Cannot edit Product that you are not owner');
    }

    const productId = req.params.id;

    const currEditProduct = {
        _id: req.params.id,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        image: req.body.image,
        price: Number(req.body.price),
    };

    try {
        // Имаме валидация в Модела, затова не ни трябва тук
        // if (Object.values(currEditBook).some(v => !v)) {
        //     throw new Error('All fields are required');
        // }

        await editProduct(productId, currEditProduct);
        // redirect according task description
        res.redirect(`/catalog/${req.params.id}/details`);

    } catch (err) {
        console.error(err);
        const errors = mapErrors(err);
        // 2 начина да добавим _id към редактирания обект:
        // currEditBook._id = bookId;  -->> служи да подадем id в edit.hs, но там диретно трием action=""
        // currBook: Object.assign(currEditBook, { _id: req.params.id }),

        res.render('edit', { title: 'Edit Product', currProduct, errors });
    }

    // same as above without try-catch
    // const gameData = req.body;
    // const gameId = req.params.id;
    // await editGame(gameId, gameData);
    // res.redirect(`/catalog/${req.params.id}/details`);
});



router.get('/catalog/:id/delete', isAuth, async (req, res) => {
    try {
        const currProduct = await getProductById(req.params.id);
        // console.log(currProduct);
        if (currProduct.owner != req.user._id) {
            throw new Error('Cannot delete Product that you are not owner');
        }

        await deleteById(req.params.id);
        res.redirect('/');
    } catch (err) {
        console.log(err.message);
        res.redirect(`/catalog/${req.params.id}/details`);
    }
});


router.post('/catalog/:id/bid', isAuth, async (req, res) => {
    const productId = req.params.id;
    const amount = Number(req.body.bidAmount);
    
    try {
        await placeBid(productId, amount, req.user._id);
    } catch (err) {
        const errors = mapErrors(err);
        console.log(errors);
        
    } finally {
        res.redirect(`/catalog/${req.params.id}/details`);
    }
});



router.get('/catalog/:id/close', isAuth, async (req, res) => {
    const id = req.params.id;

    try {
        await closeAuction(id);
        res.redirect('/profile');
    } catch (err) {
        const errors = mapErrors(err);
        console.log(errors);

        res.redirect(`/catalog/${req.params.id}/details`);

    }
});


router.get('/profile', isAuth, async (req, res) => {
    const auctions = await getAuctionsByUser(req.user._id);
    // console.log(auctions);
    
    res.render('profile', { title: 'Closed Auction', auctions });
});


// router.get('/profile', isAuth, async (req, res) => {
//     const auctions = await getAuctionsByUser(req.session.user._id);
//     res.render('profile', { title: 'Closed Auction', auctions });
// });


// router.get('/profile', isAuth, async (req, res) => {
//     const wishedBooksByUser = await getBookByUser(req.user._id);
//     // console.log(wishedBooksByUser);
//     // [
//     //     {
//     //       _id: new ObjectId("648091d0032c4e9b82cc7e62"),
//     //       title: 'Book 4 Study',
//     //       author: 'Peter Smart',
//     //       genre: 'Study',
//     //       stars: 5,
//     //       image: 'http://localhost:3000/static/image/book-4.png',
//     //       review: 'Study hard',
//     //       owner: new ObjectId("64806aec16e81be6c406baed"),
//     //       __v: 2,
//     //       usersWished: [ new ObjectId("64806822e1b2ccc415e315ef") ]
//     //     }
//     // ]

//     // Можем да добавим обекта в res.locals.името на обекта
//     // template profile -->> {{#each wishedBooks}}
//     res.locals.wishedBooks = wishedBooksByUser;
//     res.render('profile', { title: 'Profile Page'});

//     // or
//     // template profile -->> {#each user.wishedBooksByUser}}
//     // res.render('profile', {
//     //     title: 'Profile Page',
//     //     user: Object.assign({ wishedBooksByUser }, req.user)
//     // });
// });


// router.get('/search', isAuth, async (req, res) => {
//     const { cryptoName, paymentMethod } = req.query;
//     const crypto = await search(cryptoName, paymentMethod);

//     const paymentMethodsMap = {
//         "crypto-wallet": 'Crypto Wallet',
//         "credit-card": 'Credit Card',
//         "debit-card": 'Debit Card',
//         "paypal": 'PayPal',
//     };

//     const paymentMethods = Object.keys(paymentMethodsMap).map(key => ({
//         value: key, 
//         label: paymentMethodsMap[key] ,
//         isSelected: crypto.paymentMethod == key
//     }));


//     res.render('search', { crypto, paymentMethods });
// });




module.exports = router;






// console.log(currGame);;
// {
//     _id: new ObjectId("647652253addd63fbb6d6f07"),
//     platform: 'PS5',
//     name: 'Mortal Kombat',
//     image: 'http://localhost:3000/static/images/mortal-kombat.png',
//     price: 250,
//     genre: 'Action',
//     description: 'Mortal Kombat fight game for adults',
//     owner: new ObjectId("6473c444cd9aad92fcefb5e3"),
//     __v: 0
// }


//----------------------------------------------------------------

// router.post('/edit/:id'...
// console.log(req.body);
// {
//     start: 'Sofia',
//     end: 'Pamporovo',
//     date: '21.05.2023',
//     time: '18:00',
//     carImage: 'https://mobistatic3.focus.bg/mobile/photosmob/711/1/big1/11684336382439711_41.jpg',
//     carBrand: 'Infinity',
//     seats: '3',
//     price: '35',
//     description: 'Ski trip for the weekend.'
// }