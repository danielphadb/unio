"""Sonnenstand (NOAA-Naeherung, Genauigkeit unter 0,5 Grad) fuer Lichtszenarien."""
from __future__ import annotations

import math
from datetime import datetime, timedelta


def sun_position(lat: float, lon: float, date: str, time: str, tz: float) -> tuple[float, float]:
    """Liefert (Elevation, Azimut) in Grad. Azimut im Uhrzeigersinn ab Norden."""
    local = datetime.fromisoformat(f"{date}T{time}")
    utc = local - timedelta(hours=tz)
    jd = utc.toordinal() + 1721424.5 + (utc.hour + utc.minute / 60 + utc.second / 3600) / 24
    T = (jd - 2451545.0) / 36525
    L0 = (280.46646 + T * (36000.76983 + 0.0003032 * T)) % 360
    M = 357.52911 + T * (35999.05029 - 0.0001537 * T)
    e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T)
    Mr = math.radians(M)
    C = (math.sin(Mr) * (1.914602 - T * (0.004817 + 0.000014 * T))
         + math.sin(2 * Mr) * (0.019993 - 0.000101 * T) + math.sin(3 * Mr) * 0.000289)
    true_long = L0 + C
    omega = 125.04 - 1934.136 * T
    lam = true_long - 0.00569 - 0.00478 * math.sin(math.radians(omega))
    eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60
    eps = math.radians(eps0 + 0.00256 * math.cos(math.radians(omega)))
    decl = math.asin(math.sin(eps) * math.sin(math.radians(lam)))
    y = math.tan(eps / 2) ** 2
    L0r = math.radians(L0)
    eqt = 4 * math.degrees(y * math.sin(2 * L0r) - 2 * e * math.sin(Mr) + 4 * e * y * math.sin(Mr) * math.cos(2 * L0r)
                           - 0.5 * y * y * math.sin(4 * L0r) - 1.25 * e * e * math.sin(2 * Mr))
    minutes = utc.hour * 60 + utc.minute + utc.second / 60
    tst = (minutes + eqt + 4 * lon) % 1440
    ha = math.radians(tst / 4 - 180)
    latr = math.radians(lat)
    cz = math.sin(latr) * math.sin(decl) + math.cos(latr) * math.cos(decl) * math.cos(ha)
    zen = math.acos(max(-1, min(1, cz)))
    elev = 90 - math.degrees(zen)
    az = math.degrees(math.atan2(math.sin(ha), math.cos(ha) * math.sin(latr) - math.tan(decl) * math.cos(latr))) + 180
    return elev, az % 360


def sun_vector_local(elev: float, az: float, x_axis_deg: float) -> tuple[float, float, float]:
    """Richtung zur Sonne im lokalen System (x-Achse um x_axis_deg gegen Ost gedreht)."""
    el, a = math.radians(elev), math.radians(az)
    east, north, up = math.cos(el) * math.sin(a), math.cos(el) * math.cos(a), math.sin(el)
    r = math.radians(x_axis_deg)
    return (east * math.cos(r) + north * math.sin(r), -east * math.sin(r) + north * math.cos(r), up)
