exports.homePage = function(req, res) {
    res.render('homePage', {
        pageTitle: 'My Items'
    });
};

exports.competitorsPage = function(req, res) {
    res.render('competitorsPage', {
        pageTitle: 'My Competitors'
    });
};

exports.viewItemPage = function(req, res) {
    res.render('viewItemPage', {
        pageTitle: 'Item Info'
    });
};
