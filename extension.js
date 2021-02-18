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
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "hashnodeBlogSearch.searchUserBlogs",
      async function () {
        //1. Get the username
        const username = await vscode.window.showInputBox({
          placeHolder: "Enter a valid Hashnode username",
        });
        //2. fetch blogs for that username
        if (!username) return;

        let userBlogs = await fetchUserBlogs(username, page);

        if (!userBlogs) {
          vscode.window.showInformationMessage(
            "User doesn't exist on HashNode."
          );
          return;
        }

        //3. Extract needed data from returned blogs to oldBlogsArr
        //4. allBLogs = [...oldBlogsArr,...[]]
        let allBlogs = mergeBlogs(userBlogs);

        console.log({ allBlogs });
        //5. Display arr in QuickPick and Load more at end
        const displayBlogsOnQuickPick = async (allBlogs) => {
          let loadMore = {
            label: "Load More",
            description: "",
          };
          return await vscode.window.showQuickPick([...allBlogs, loadMore], {
            matchOnDetail: true,
          });
        };

        let selectedBlog = await displayBlogsOnQuickPick(allBlogs);

        if (!selectedBlog) {
          page = 0;
          return;
        }

        //6. Now on "Load More"
        while (selectedBlog && selectedBlog.label === "Load More") {
          //7. fetch new blogs by page++
          allBlogs = mergeBlogs(await fetchUserBlogs(username, ++page));
          //8. Repeat steps 4-7
          selectedBlog = await displayBlogsOnQuickPick(allBlogs);
        }

        // 9. Else just open the blog
        page = 0;
        vscode.env.openExternal(
          `https://hashnode.com/post/${selectedBlog.slug}`
        );
      }
    )
  );
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
