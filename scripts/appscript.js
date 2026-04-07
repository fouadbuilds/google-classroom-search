// This Script is Hosted on Google App Script on My Account

 

// ─── Entry point ──────────────────────────────────────────────────────────────
function doGet(e) {
  const cache = PropertiesService.getScriptProperties().getProperty("index");
  const email = Session.getActiveUser().getEmail();
  const items = cache ? JSON.parse(cache) : buildIndex();
  if (!cache) {
    PropertiesService.getScriptProperties().setProperty("index", JSON.stringify(items));
  }
  return ContentService.createTextOutput(JSON.stringify({ items, email }))
    .setMimeType(ContentService.MimeType.JSON);
}


// ─── Index builder ────────────────────────────────────────────────────────────

function rfc3339ToMs(iso) {
  if (!iso) return 0;
  return new Date(iso).getTime();
}

function buildIndex() {
  const items = [];

  let pageToken = null;
  let courses = [];

  // fetch all active courses
  do {
    const resp = Classroom.Courses.list({
      courseStates: ["ACTIVE"],
      pageSize: 20,
      pageToken: pageToken || undefined,
    });
    if (resp.courses) courses = courses.concat(resp.courses);
    pageToken = resp.nextPageToken;
  } while (pageToken);

  for (const course of courses) {
    const id = course.id;
    const name = course.name;

    // ── Assignments + Quiz assignments ────────────────────────────────────────
    try {
      let cwToken = null;
      do {
        const cw = Classroom.Courses.CourseWork.list(id, {
          pageSize: 50,
          pageToken: cwToken || undefined,
        });
        (cw.courseWork || []).forEach((work) => {
          const postedAt = rfc3339ToMs(work.creationTime || work.updateTime || null);
          items.push({
            title: work.title,
            type: "Assignment",
            course: name,
            link: work.alternateLink,
            postedAt: postedAt,
          });
        });
        cwToken = cw.nextPageToken;
      } while (cwToken);
    } catch (e) { /* no coursework */ }

    // ── Materials ─────────────────────────────────────────────────────────────
    try {
      let matToken = null;
      do {
        const mat = Classroom.Courses.CourseWorkMaterials.list(id, {
          pageSize: 50,
          pageToken: matToken || undefined,
        });
        (mat.courseWorkMaterial || []).forEach((m) => {
          const postedAt = rfc3339ToMs(m.creationTime || m.updateTime || null);
          items.push({
            title: m.title,
            type: "Material",
            course: name,
            link: m.alternateLink,
            postedAt: postedAt,
          });
        });
        matToken = mat.nextPageToken;
      } while (matToken);
    } catch (e) { /* no materials */ }

    // ── Announcements ─────────────────────────────────────────────────────────
    try {
      let annToken = null;
      do {
        const ann = Classroom.Courses.Announcements.list(id, {
          announcementStates: ["PUBLISHED"],
          pageSize: 50,
          pageToken: annToken || undefined,
        });
        (ann.announcements || []).forEach((a) => {
          const postedAt = rfc3339ToMs(a.creationTime || a.updateTime || null);
          items.push({
            title: a.text
              ? a.text.substring(0, 80).replace(/\n/g, " ").trim()
              : "Announcement",
            type: "Announcement",
            course: name,
            link: a.alternateLink,
            postedAt: postedAt,
          });
        });
        annToken = ann.nextPageToken;
      } while (annToken);
    } catch (e) { /* no announcements */ }
  }

  // sort newest first
  items.sort(function(a, b) {
    const ta = a.postedAt || 0;
    const tb = b.postedAt || 0;
    if (tb !== ta) return tb - ta;
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
    return 0;
  });

  Logger.log("Built index: " + items.length + " items across " + courses.length + " courses");
  return items;
}


// ─── Triggered rebuild every 30 mins ─────────────────────────────────────────

function rebuildCache() {
  const items = buildIndex();
  PropertiesService.getScriptProperties().setProperty("index", JSON.stringify(items));
  Logger.log("Cache rebuilt — " + items.length + " items");
}


// ─── Manual test ──────────────────────────────────────────────────────────────

function testIndex() {
  const items = buildIndex();
  items.slice(0, 5).forEach((i) => Logger.log(JSON.stringify(i)));
}