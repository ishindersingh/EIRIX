import { RequestHandler } from "express";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Student {
  id: string; rollNo: string; name: string; email: string;
  password: string; course: string; year: string; age: number;
}
interface Parent {
  id: string; name: string; email: string;
  password: string; studentRollNo: string;
}
interface Mentor {
  id: string; employeeId: string; name: string; email: string;
  password: string; department: string; designation: string;
  studentRollNos: string[];
}

// ── Pre-seeded data ────────────────────────────────────────────────────────────
const STUDENTS: Student[] = [
  { id: "s1", rollNo: "CS2021001",  name: "Alex Johnson",  email: "alex@university.edu",   password: "alex123",   course: "BTech CS",   year: "2nd Year", age: 20 },
  { id: "s2", rollNo: "CS2021002",  name: "Priya Sharma",  email: "priya@university.edu",  password: "priya123",  course: "BTech CS",   year: "2nd Year", age: 19 },
  { id: "s3", rollNo: "ME2022001",  name: "Rahul Verma",   email: "rahul@university.edu",  password: "rahul123",  course: "BTech Mech", year: "1st Year", age: 18 },
  { id: "s4", rollNo: "BCA2020001", name: "Sneha Patel",   email: "sneha@university.edu",  password: "sneha123",  course: "BCA",        year: "3rd Year", age: 21 },
  { id: "s5", rollNo: "MBA2023001", name: "Arjun Mehta",   email: "arjun@university.edu",  password: "arjun123",  course: "MBA",        year: "1st Year", age: 23 },
];

const PARENTS: Parent[] = [
  { id: "p1", name: "Robert Johnson", email: "robert@gmail.com",  password: "parent123", studentRollNo: "CS2021001"  },
  { id: "p2", name: "Meena Sharma",   email: "meena@gmail.com",   password: "parent123", studentRollNo: "CS2021002"  },
  { id: "p3", name: "Suresh Verma",   email: "suresh@gmail.com",  password: "parent123", studentRollNo: "ME2022001"  },
  { id: "p4", name: "Gita Patel",     email: "gita@gmail.com",    password: "parent123", studentRollNo: "BCA2020001" },
  { id: "p5", name: "Kavita Mehta",   email: "kavita@gmail.com",  password: "parent123", studentRollNo: "MBA2023001" },
];

const MENTORS: Mentor[] = [
  { id: "m1", employeeId: "EMP001", name: "Dr. Ramesh Kumar",  email: "ramesh@university.edu", password: "mentor123", department: "Computer Science", designation: "Associate Professor", studentRollNos: ["CS2021001","CS2021002"] },
  { id: "m2", employeeId: "EMP002", name: "Prof. Anita Singh", email: "anita@university.edu",  password: "mentor123", department: "Mechanical Eng",  designation: "Assistant Professor", studentRollNos: ["ME2022001"] },
  { id: "m3", employeeId: "EMP003", name: "Dr. Vijay Nair",   email: "vijay@university.edu",  password: "mentor123", department: "Management",       designation: "Professor",           studentRollNos: ["BCA2020001","MBA2023001"] },
];

// ── Verified Students Store (Feature 1) ───────────────────────────────────────
// Stores roll numbers of students who have successfully logged in (no duplicates)
const verifiedStudents = new Set<string>();
const verifiedStudentLog: { rollNo: string; name: string; loginAt: string }[] = [];

function markVerified(rollNo: string, name: string) {
  const key = rollNo.toUpperCase();
  if (!verifiedStudents.has(key)) {
    verifiedStudents.add(key);
    verifiedStudentLog.push({ rollNo: key, name, loginAt: new Date().toISOString() });
  }
}

function isVerified(rollNo: string): boolean {
  return verifiedStudents.has(rollNo.toUpperCase());
}

// Pre-mark all demo students as verified so parents can access immediately
STUDENTS.forEach(s => markVerified(s.rollNo, s.name));

// ── Token helper ───────────────────────────────────────────────────────────────
function makeToken(id: string, role: string): string {
  return Buffer.from(JSON.stringify({ id, role, iat: Date.now() })).toString("base64");
}

// ── Verified students endpoints ────────────────────────────────────────────────
export const handleGetVerifiedStudents: RequestHandler = (_req, res) => {
  res.json({ verified: verifiedStudentLog });
};

export const handleCheckVerified: RequestHandler = (req, res) => {
  const rollNo = (Array.isArray(req.params.rollNo) ? req.params.rollNo[0] : req.params.rollNo).toUpperCase();
  if (isVerified(rollNo)) {
    const student = STUDENTS.find(s => s.rollNo === rollNo);
    res.json({
      verified: true,
      student: student
        ? { rollNo: student.rollNo, name: student.name, course: student.course, year: student.year }
        : { rollNo },
    });
  } else {
    res.status(404).json({ verified: false, error: "Invalid or Not Found" });
  }
};

// ── Student login (auto-registers + marks verified) ───────────────────────────
export const handleStudentLogin: RequestHandler = (req, res) => {
  const { rollNo, email, password, name } = req.body;

  if (!rollNo || !email || !password) {
    res.status(400).json({ error: "Roll number, email and password are required" });
    return;
  }

  let student = STUDENTS.find(s =>
    s.rollNo.toLowerCase() === rollNo.toLowerCase() &&
    s.email.toLowerCase() === email.toLowerCase()
  );

  if (student) {
    if (student.password !== password) {
      res.status(401).json({ error: "Incorrect password" });
      return;
    }
  } else {
    student = {
      id: `s${Date.now()}`,
      rollNo:   rollNo.trim().toUpperCase(),
      name:     name?.trim() || rollNo.trim(),
      email:    email.trim().toLowerCase(),
      password: password,
      course:   "General",
      year:     "1st Year",
      age:      18,
    };
    STUDENTS.push(student);
  }

  // Feature 1: Mark as verified on successful login
  markVerified(student.rollNo, student.name);

  res.json({
    token: makeToken(student.id, "student"),
    user: {
      id:     student.id,
      rollNo: student.rollNo,
      name:   student.name,
      email:  student.email,
      course: student.course,
      year:   student.year,
      age:    student.age,
      role:   "student",
    },
  });
};

// ── Parent login (auto-registers) ─────────────────────────────────────────────
export const handleParentLogin: RequestHandler = (req, res) => {
  const { email, password, name, studentRollNo } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  let parent = PARENTS.find(p => p.email.toLowerCase() === email.toLowerCase());

  if (parent) {
    if (parent.password !== password) {
      res.status(401).json({ error: "Incorrect password" });
      return;
    }
  } else {
    const linkedRollNo = studentRollNo?.trim().toUpperCase() || "";
    parent = {
      id:            `p${Date.now()}`,
      name:          name?.trim() || email.split("@")[0],
      email:         email.trim().toLowerCase(),
      password:      password,
      studentRollNo: linkedRollNo,
    };
    PARENTS.push(parent);
  }

  const student = STUDENTS.find(s => s.rollNo === parent!.studentRollNo);

  res.json({
    token: makeToken(parent.id, "parent"),
    user: {
      id:            parent.id,
      name:          parent.name,
      email:         parent.email,
      role:          "parent",
      studentRollNo: parent.studentRollNo,
      studentName:   student?.name ?? parent.studentRollNo ?? "Unknown",
    },
  });
};

// ── Student lookup ─────────────────────────────────────────────────────────────
export const handleStudentLookup: RequestHandler = (req, res) => {
  const rollNo = Array.isArray(req.params.rollNo) ? req.params.rollNo[0] : req.params.rollNo;
  const student = STUDENTS.find(s => s.rollNo.toLowerCase() === rollNo.toLowerCase());
  if (!student) { res.status(404).json({ error: "Student not found" }); return; }
  res.json({ rollNo: student.rollNo, name: student.name, course: student.course, year: student.year, age: student.age });
};

// ── Mentor login (auto-registers) ─────────────────────────────────────────────
export const handleMentorLogin: RequestHandler = (req, res) => {
  const { employeeId, email, password, name, department, designation } = req.body;

  if (!employeeId || !email || !password) {
    res.status(400).json({ error: "Employee ID, email and password are required" });
    return;
  }

  let mentor = MENTORS.find(m =>
    m.employeeId.toLowerCase() === employeeId.toLowerCase() &&
    m.email.toLowerCase() === email.toLowerCase()
  );

  if (mentor) {
    if (mentor.password !== password) { res.status(401).json({ error: "Incorrect password" }); return; }
  } else {
    mentor = {
      id:             `m${Date.now()}`,
      employeeId:     employeeId.trim().toUpperCase(),
      name:           name?.trim() || employeeId.trim(),
      email:          email.trim().toLowerCase(),
      password:       password,
      department:     department?.trim() || "General",
      designation:    designation?.trim() || "Faculty",
      studentRollNos: [],
    };
    MENTORS.push(mentor);
  }

  const assignedStudents = STUDENTS
    .filter(s => mentor!.studentRollNos.includes(s.rollNo))
    .map(s => ({ rollNo: s.rollNo, name: s.name, course: s.course, year: s.year }));

  res.json({
    token: makeToken(mentor.id, "mentor"),
    user: {
      id:               mentor.id,
      employeeId:       mentor.employeeId,
      name:             mentor.name,
      email:            mentor.email,
      department:       mentor.department,
      designation:      mentor.designation,
      role:             "mentor",
      studentRollNos:   mentor.studentRollNos,
      assignedStudents,
    },
  });
};

// ── Mentor students ────────────────────────────────────────────────────────────
export const handleMentorStudents: RequestHandler = (req, res) => {
  const employeeId = Array.isArray(req.params.employeeId) ? req.params.employeeId[0] : req.params.employeeId;
  const mentor = MENTORS.find(m => m.employeeId.toLowerCase() === employeeId.toLowerCase());
  if (!mentor) { res.status(404).json({ error: "Mentor not found" }); return; }
  const students = STUDENTS
    .filter(s => mentor.studentRollNos.includes(s.rollNo))
    .map(s => ({ rollNo: s.rollNo, name: s.name, course: s.course, year: s.year, age: s.age }));
  res.json({ students });
};

// ── Get all students ───────────────────────────────────────────────────────────
export const handleGetStudents: RequestHandler = (_req, res) => {
  res.json(STUDENTS.map(s => ({ rollNo: s.rollNo, name: s.name, course: s.course, year: s.year })));
};
