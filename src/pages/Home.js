import React from 'react';

import Calendar from '../components/Calendar';
import Navbar from '../components/Navbar';
import NavBottom from '../components/NavBottom';
import DeleteBtn from '../components/Deletebtn';
import CreateTask from './CreateTask';
import StartTask from './StartTask';
import SideDefault from '../components/SideDefault';
import EditTask from './EditTask';

import no_task from '../assets/img/no_task.png';
import clock from '../assets/img/icons/clock.svg';
import calendar from '../assets/img/icons/calendar.svg';
import check from '../assets/img/icons/check.svg';
import editbutton from '../assets/img/icons/edit.svg';
import back from '../assets/img/icons/back.svg';
import backgroundImg from '../assets/img/background-mobile.png';

import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/authContext';
import { format } from 'date-fns';
import Modal from 'react-modal';
import api from '../apis/api';

import './home.css';

function Home() {
  const { loggedInUser } = useContext(AuthContext);

  const [active, setActive] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [state, setState] = useState([]);
  const [showSideDefault, setShowSideDefault] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showStartTask, setShowStartTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [taskId, setTaskId] = useState('');
  const [currentActiveTask, setcurrentActiveTask] = useState('');

  const navigate = useNavigate();

  Modal.setAppElement('#root');

  useEffect(() => {
    fetchData();
  }, [active]);

  async function fetchData() {
    try {
      const response = await api.get(`/tasks/${active}`, {});
      setState([...response.data]);
    } catch (err) {
      console.error(err);
    }
  }

  function handleDayClick({ target }) {
    setActive(target.value);
  }

  async function handleEndClick() {
    try {
      await api.patch(`/task/endtask/${taskId}`, {
        done: true,
      });

      fetchData();
      setShowStartTask(false);
      setShowSideDefault(true);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  }
  const handleStartClick = (id) => {
    setTaskId(id);
    setShowStartTask(true);
    setShowSideDefault(false);
    setShowCreateTask(false);
  };

  const handleEditClick = (id) => {
    setTaskId(id);
    setShowEditTask(true);
    setShowStartTask(false);
    setShowSideDefault(false);
    setShowCreateTask(false);
  };

  useEffect(() => {
    const filtered = state.filter((task) => task.done === false);
    if (filtered.length) {
      setcurrentActiveTask(filtered[0]._id);
    }
  }, [state]);

  function handleShowModal(id) {
    setTaskId(id);
    setShowModal(true);
  }

  return (
    <div className='web-container'>
      <div className='container-default'>
        <Navbar
          setShowCreateTask={setShowCreateTask}
          setShowSideDefault={setShowSideDefault}
          setShowStartTask={setShowStartTask}
        />
        <div className='header'>
          <h1> Welcome, {loggedInUser.user.name}!</h1>
        </div>

        {/* <div> */}
        <Calendar onClick={handleDayClick} active={active} />
        {/* </div> */}

        <div className='tasks-container'>
          <h2>Tasks</h2>
          {!state.length ? (
            <div className='taskcards-group'>
              <img
                className='notasks-img hide-web'
                src={no_task}
                alt='sem task'
              />
              <p className='notasks-msg hide-web'>
                Press “ + “ in the menu and create your tasks
              </p>
            </div>
          ) : (
            <div className='taskcards-group'>
              {state.map((task) => {
                const { _id, name, steps, startdate, enddate, done } = task;
                return (
                  <div
                    key={_id}
                    className={`task-card
                      ${_id === currentActiveTask ? 'urgent' : 'not-urgent'} ${
                      done ? 'done' : null
                    }`}
                  >
                    <div className='task-top'>
                      <h3>{name}</h3>
                      {!done ? (
                        <>
                          <button
                            disabled={_id !== currentActiveTask}
                            className='start-btn start-web'
                            onClick={() => {
                              handleStartClick(_id);
                            }}
                          >
                            Start
                          </button>

                          <button
                            disabled={_id !== currentActiveTask}
                            className='start-btn hide-web'
                            onClick={() => handleShowModal(_id)}
                          >
                            Start
                          </button>
                        </>
                      ) : (
                        <img
                          style={{
                            width: '30px',
                          }}
                          src={check}
                          alt='check'
                        />
                        // </h3>
                      )}
                    </div>
                    <div className='steps'>
                      <div className='icon-text-box'>
                        <img src={check} alt='check' />
                        <p className='steps-text'>Steps:</p>
                      </div>
                      <div className='step-list'>
                        {steps.map((step) => (
                          <div key={step._id} className='step-item'>
                            <div className='status' />
                            <p>{step.description}</p>
                          </div>
                        ))}
                      </div>
                      <div className='icon-text-box'>
                        <img src={check} alt='check' />
                        <p className='steps-text'>
                          Start your task and don't forget to checkmark it!
                        </p>
                      </div>
                    </div>

                    <div className='task-bottom'>
                      <div className='icon-text-box'>
                        <img src={clock} alt='Clock icon' />
                        <p className='date-time'>
                          {format(new Date(startdate), 'HH:mm')} -{' '}
                          {format(new Date(enddate), 'HH:mm')}
                        </p>
                        <img src={calendar} alt='Calendar icon' />
                        <p className='date-time'>
                          {format(new Date(startdate), 'dd/MM/yyyy')}
                        </p>
                      </div>

                      <div className='icon-btns'>
                        <button
                          className='icon-btn hide-web'
                          onClick={() => navigate(`/edit_task/${_id}`)}
                        >
                          <img src={editbutton} alt='Edit task' />
                        </button>
                        <button
                          className='icon-btn start-web'
                          onClick={() => {
                            handleEditClick(_id);
                          }}
                        >
                          <img src={editbutton} alt='Edit task' />
                        </button>
                        <DeleteBtn _id={_id} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <NavBottom />
      </div>

      <div className='show-side'>
        {showSideDefault && <SideDefault />}
        {showCreateTask && <CreateTask />}
        {/* {showCreateTask && <CreateTask />} */}
        {showStartTask && <StartTask id={taskId} onEnd={handleEndClick} />}
        {showEditTask && (
          <EditTask
            onEdit={setShowEditTask}
            onDefault={setShowSideDefault}
            id={taskId}
          />
        )}
      </div>

      <Modal
        isOpen={showModal}
        style={{
          content: {
            width: '100%',
            height: '100%',
            padding: '0',
            position: 'unset',
            border: 'none',
            paddingBottom: '10px',
            backgroundImage: `url(${backgroundImg})`,
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
          },
        }}
      >
        <button className='nav-btns' onClick={() => setShowModal(false)}>
          <img src={back} alt='Back icon' />
        </button>
        <StartTask id={taskId} onEnd={handleEndClick} />
      </Modal>
    </div>
  );
}

export default Home;
