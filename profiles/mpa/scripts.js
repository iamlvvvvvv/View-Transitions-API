const basePath = "/View-Transitions-API/profiles/mpa";

const homePagePattern = new URLPattern(`${basePath}(/)*`, window.origin);
const isHomePage = (url) => {
  return homePagePattern.exec(url);
};

const profilePagePattern = new URLPattern(
  `${basePath}/:profile`,
  window.origin
);
const isProfilePage = (url) => {
  return profilePagePattern.exec(url);
};

const extractProfileNameFromUrl = (url) => {
  const match = profilePagePattern.exec(url);
  return match?.pathname.groups.profile;
};

const setTemporaryViewTransitionNames = async (entries, vtPromise) => {
  for (const [$el, name] of entries) {
    $el.style.viewTransitionName = name;
  }
  await vtPromise;
  for (const [$el, name] of entries) {
    $el.style.viewTransitionName = "";
  }
};

//转到详细信息页面时，设置“个人资料名称”和“个人资料头像” 名称
//在链接到该详细信息页的元素上
window.addEventListener("pageswap", async (e) => {
  if (e.viewTransition) {
    const currentUrl = e.activation.from?.url
      ? new URL(e.activation.from.url)
      : null;
    const targetUrl = new URL(e.activation.entry.url);

    //仅转换到相同的basePath
    //>>跳过！
    if (!targetUrl.pathname.startsWith(basePath)) {
      e.viewTransition.skipTransition();
    }

    //从个人资料页面转到主页
    if (isProfilePage(currentUrl) && isHomePage(targetUrl)) {
      setTemporaryViewTransitionNames(
        [
          [document.querySelector(`#detail main h1`), "name"],
          [document.querySelector(`#detail main img`), "avatar"],
        ],
        e.viewTransition.ready
      );
    }

    //转到个人资料页
    if (isProfilePage(targetUrl)) {
      const profile = extractProfileNameFromUrl(targetUrl).split(".")[0];
      console.log(profile)
      setTemporaryViewTransitionNames(
        [
          [document.querySelector(`#${profile} span`), "name"],
          [document.querySelector(`#${profile} img`), "avatar"],
        ],
        e.viewTransition.ready
      );
    }
  }
});

//从详细信息页面转到主页时，设置“个人资料名称”和“个人资料头像”vt名称
//在详细信息页上查看的配置文件的列表项上。
window.addEventListener("pagereveal", async (e) => {
  if (!navigation.activation.from) return;
  if (e.viewTransition) {
    const fromUrl = new URL(navigation.activation.from.url);
    const currentUrl = new URL(navigation.activation.entry.url);

    //仅转换到相同的basePath
    //>>跳过！
    if (!fromUrl.pathname.startsWith(basePath)) {
      e.viewTransition.skipTransition();
    }

    //从个人资料页面转到主页
    if (isProfilePage(fromUrl) && isHomePage(currentUrl)) {
      const profile = extractProfileNameFromUrl(fromUrl).split(".")[0];
      setTemporaryViewTransitionNames(
        [
          [document.querySelector(`#${profile} span`), "name"],
          [document.querySelector(`#${profile} img`), "avatar"],
        ],
        e.viewTransition.finished
      );
    }

    //转到个人资料页
    if (isProfilePage(currentUrl)) {
      setTemporaryViewTransitionNames(
        [
          [document.querySelector(`#detail main h1`), "name"],
          [document.querySelector(`#detail main img`), "avatar"],
        ],
        e.viewTransition.finished
      );
    }
  }
});
