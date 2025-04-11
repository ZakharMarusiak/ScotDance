exports.renderHomePage = (req, res) => {
    res.render('public/index', { title: 'Home' });
};