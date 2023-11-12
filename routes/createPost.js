const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { route } = require("./auth");
const requireLogin = require("../middlewares/requireLogin");
const POST = mongoose.model("POST");

//Route
// to display the posts
router.get("/allposts", requireLogin, (req, res) => {
  POST.find()
    .populate("postedBy", "_id name Photo")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")
    .then((posts) => res.json(posts))
    .catch((err) => console.log(err));
});

//to create a new post
router.post("/createPost", requireLogin, (req, res) => {
  const { body, pic } = req.body;
  console.log(pic);
  if (!body || !pic) {
    return res.status(422).json({ error: "Please add all the fields" });
  }
  console.log(req.user);
  const post = new POST({
    body,
    photo: pic,
    postedBy: req.user,
  });
  post
    .save()
    .then((result) => {
      return res.json({ post: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

//to update the Profile page
router.get("/myposts", requireLogin, (req, res) => {
  // console.log(req.user._id);
  POST.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")

    .then((myposts) => {
      res.json(myposts);
    })
    .catch((err) => console.log(err));
});

// For Likes
router.put("/like", requireLogin, (req, res) => {
  POST.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  )

    .populate("postedBy", "_id name Photo")
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      return res.status(422).json({ error: err });
    });
});
// For UnLikes
router.put("/unlike", requireLogin, (req, res) => {
  POST.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id name Photo")
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      return res.status(422).json({ error: err });
    });
});

// Comments

router.put("/comment", requireLogin, (req, res) => {
  const comment = {
    comment: req.body.text,
    postedBy: req.user._id,
  };
  POST.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name Photo")
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      return res.status(422).json({ error: err });
    });
});

// Api to delete Post
router.delete("/deletePost/:postId", requireLogin, (req, res) => {
  // POST.findById(req.params.postId)
  POST.findOne({ _id: req.params.postId })

    .populate("postedBy", "_id")
    .then((post) => {
      console.log(post);
      if (post.postedBy._id.toString() == req.user._id.toString()) {



        console.log("Inside if ");
        // post.remove()
        post.deleteOne()
          .then((result) => {
            return res.json({ message: "Post Successfully deleted" })
          })
          .catch((err) => {
            console.log("delete api error ", err);
          });
      }
    })
    .catch((err) => {
      return res.status(422).json({ error: err, });
    });
});


// Api to show following post
router.get("/myfollowingpost", requireLogin, (req, res) => {
  POST.find({ postedBy: { $in: req.user.following } })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")
    .then(posts => {
      res.json(posts)
    })
    .catch(err => { console.log(err) })
})
module.exports = router;
