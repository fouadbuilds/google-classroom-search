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
          items.push({
            title: work.title,
            type: "Assignment",
            course: name,
            link: work.alternateLink,
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
          items.push({
            title: m.title,
            type: "Material",
            course: name,
            link: m.alternateLink,
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
          items.push({
            title: a.text
              ? a.text.substring(0, 80).replace(/\n/g, " ").trim()
              : "Announcement",
            type: "Announcement",
            course: name,
            link: a.alternateLink,
          });
        });
        annToken = ann.nextPageToken;
      } while (annToken);
    } catch (e) { /* no announcements */ }
  }

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