const { default: axios } = require("axios");
const vscode = require("vscode");

let page = 0;

async function activate(context) {
  const fetchUserBlogs = async (username, page) => {
    const {
      data: {
        data: {
          user: { publication },
        },
      },
    } = await axios({
      url: "https://api.hashnode.com",
      method: "POST",
      data: {
        query: `
        query {
          user(username: "${username}") {
            publicationDomain
            publication {
              posts(page: ${page}) {
                title
                brief
                slug
              }
            }
          }
        }
        `,
      },
    });

    if (!publication) return null;

    return publication.posts;
  };

  let disposable = vscode.commands.registerCommand(
    "hashnodeBlogSearch.searchUserBlogs",
    async function () {
      const username = await vscode.window.showInputBox({
        placeHolder: "Enter a valid Hashnode username",
      });

      const mergeBlogs = (arr1, arr2 = []) => {
        arr1 = arr1.map((blog) => ({
          label: blog.title,
          description: blog.brief,
          slug: blog.slug,
        }));
        arr2 = arr2.map((blog) => ({
          label: blog.title,
          description: blog.brief,
          slug: blog.slug,
        }));

        return [...arr1, ...arr2];
      };

      if (!username) return;

      let userBlogs = await fetchUserBlogs(username, page);

      if (!userBlogs) {
        vscode.window.showInformationMessage("User doesn't exist on HashNode.");
        return;
      }

      let allBlogs = mergeBlogs(userBlogs);

      console.log(allBlogs);

      let loadMore = {
        label: "Load More",
        description: "",
      };

      const displayBlogsOnQuickPick = async (blogsArr) => {
        return await vscode.window.showQuickPick([...blogsArr, loadMore], {
          matchOnDetail: true,
        });
      };

      const selectedBlog = await displayBlogsOnQuickPick(allBlogs);

      if (!selectedBlog) return;

      switch (selectedBlog.label) {
        case "Load More":
          allBlogs = mergeBlogs(
            allBlogs,
            await fetchUserBlogs(username, page++)
          );

          console.log(allBlogs);
          break;
        default:
          vscode.env.openExternal(
            `https://hashnode.com/post/${selectedBlog.slug}`
          );
          break;
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
