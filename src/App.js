import React, { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";

function APP() {
  const [contacts, setContacts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [add, setAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const fetchContacts = async (page) => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages); // clamp it down
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `https://contact-list-backend-5qqv.onrender.com/api/contacts?page=${page}&limit=${limit}`
      );

      if (res.status !== 200) {
        throw new Error("Failed to fetch contacts");
      }

      const { contacts = [], totalPages = 0, total = 0 } = res.data;

      setContacts(contacts);
      setTotalPages(totalPages);
      setTotal(total);
      setPage(page);
    } catch (err) {
      console.error("Fetch contacts error:", err.message || err);
      toast.error("Error fetching contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(page);
  }, [page, limit]);

  const addFormData = async () => {
    try {
      const res = await axios.post(
        "https://contact-list-backend-5qqv.onrender.com/api/contact",
        form
      );
      if (res.status === 201) {
        setForm({ name: "", email: "", phone: "" });
        setAdd(false);
        fetchContacts(page);
        toast("Contact added successfully", { type: "success" });
      }
    } catch (err) {
      console.error(err);
      toast(err?.response?.data?.message || "Error adding contact", {
        type: "error",
      });
    }
  };

  const deleteButton = async (id) => {
    try {
      const res = await axios.delete(
        `https://contact-list-backend-5qqv.onrender.com/api/contact/${id}`
      );
      if (res.status === 200) {
        if (contacts.length === 1) {
          console.log("Last contact on page deleted");
          setPage(page - 1); // go back to previous page
        } else {
          fetchContacts(page);
          toast("Contact deleted successfully", { type: "success" });
        }
      }
    } catch (err) {
      console.error(err);
      toast(err?.response?.data?.message || "Error deleting contact", {
        type: "error",
      });
    }
  };

  return (
    <div className="d-flex flex-column align-items-center bg-danger pt-5 pb-5 min-vh-100">
      <div className="device-container bg-white rounded" data-bs-spy="scroll">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h1 className="fs-4 text-center">
            Contact List{" "}
            <span className="text-secondary" style={{ fontSize: "20px" }}>
              ({total})
            </span>
          </h1>
          <div className="d-flex justify-content-center align-items-center">
            {add ? (
              <button
                onClick={() => setAdd((prev) => !prev)}
                className="rounded border-0 d-flex justify-content-center align-items-center bg-danger text-white"
              >
                ADD-
              </button>
            ) : (
              <button
                onClick={() => setAdd((prev) => !prev)}
                className="rounded border-0 d-flex justify-content-center align-items-center bg-danger text-white"
              >
                ADD+
              </button>
            )}
          </div>
        </div>
        {add && (
          <form
            className="p-3 border-bottom"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label">
                Phone
              </label>
              <input
                type="text"
                className="form-control"
                id="phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary d-flex justify-content-center align-items-center"
              onClick={addFormData}
            >
              Submit
            </button>
          </form>
        )}
        {loading && <Spinner animation="border" variant="secondary" />}

        <ul className="list-unstyled">
          {contacts.map((contact) => {
            const { _id, name, email, phone } = contact;
            return (
              <li
                key={_id}
                className="d-flex justify-content-between align-items-center border-bottom p-2"
              >
                <div>
                  <h2 className="text-danger">{name}</h2>
                  <p className="text-secondary">Email: {email}</p>
                  <p className="text-secondary">Phone: {phone}</p>
                </div>
                <button
                  onClick={() => deleteButton(_id)}
                  className="wrong-button bg-secondary text-white p-2 rounded-circle d-flex justify-content-center align-items-center"
                >
                  X
                </button>
              </li>
            );
          })}
        </ul>
        <div className="bottom-container d-flex justify-content-center align-items-center flex-column">
          <div className="bottom-controls">
            <button
              className="rounded border-0 d-flex justify-content-center align-items-center"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>
            <p>
              Page <span className="text-danger">{page}</span> of{" "}
              <span className="text-danger">{totalPages}</span> totalPages
            </p>
            <button
              onClick={() => setPage(page + 1)}
              disabled={totalPages === page}
              className="rounded border-0 d-flex justify-content-center align-items-center"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default APP;
